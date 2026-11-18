const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function paymentStep(responses) {
  const state = [];
  let index = 0;
  let registrations = 0;
  const requests = [];
  const context = vm.createContext({
    exports: {}, AbortController, setTimeout, clearTimeout, Uint8Array, btoa,
    fetch: async (_url, options) => { requests.push(JSON.parse(options.body)); return { json: async () => responses.shift() }; },
    require: name => {
      if (name === 'react') return { ...React, useId: () => 'receipt-test', useState: initial => {
        const n = index++; if (!(n in state)) state[n] = initial;
        return [state[n], value => { state[n] = value; }];
      } };
      if (name === '@/lib/base-path') return { withBasePath: path => path };
      if (name === '@/lib/registration') return { MAX_RECEIPT_BYTES: 5242880, REGISTRATION_ENDPOINT: 'https://example.test', REGISTRATION_INFO: { contactEmail: 'test@example.test' } };
      return require(name);
    },
  });
  vm.runInContext(ts.transpileModule(fs.readFileSync('src/app/(site)/registration/payment-step.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017 },
  }).outputText, context);
  const render = () => { index = 0; return context.exports.default({ submissionId: 'WACCI-12345678', receiptToken: 'token', email: 'ada@example.com', onRegisterAnother() { registrations++; } }); };
  const markup = () => renderToStaticMarkup(render());
  return { render, markup, requests, registrations: () => registrations };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = find(child, predicate); if (found) return found;
  }
  return null;
}
async function upload(component) {
  const file = { name: 'receipt.pdf', type: 'application/pdf', size: 10, arrayBuffer: async () => new TextEncoder().encode('%PDF-1.4\n').buffer };
  find(component.render(), node => node.type === 'input').props.onChange({ target: { files: [file] } });
  await find(component.render(), node => node.type === 'form').props.onSubmit({ preventDefault() {} });
}

test('successful upload switches to thank-you view with email address and no payment QR', async () => {
  const c = paymentStep([{ ok: true, receiptSaved: true, confirmationEmailSent: true }]);
  assert.match(c.markup(), /QR_pago_WACCI/);
  assert.doesNotMatch(c.markup(), /Register another person/);
  await upload(c);
  assert.match(c.markup(), /Thank you for registering!/);
  assert.match(c.markup(), /ada@example.com/);
  assert.match(c.markup(), /has been sent/);
  assert.doesNotMatch(c.markup(), /QR_pago_WACCI|type="file"|text-emerald/);
  find(c.render(), node => node.type === 'button' && node.props.children === 'Register another person').props.onClick();
  assert.equal(c.registrations(), 1);
});

test('email failure still hides QR; retry sends only the existing registration credentials', async () => {
  const c = paymentStep([{ ok: true, receiptSaved: true, confirmationEmailSent: false, message: 'Your receipt is saved. We could not confirm that your email was sent. Please retry or contact wacci2026@gmail.com.' }, { ok: true, receiptSaved: true, confirmationEmailSent: true }]);
  await upload(c);
  assert.match(c.markup(), /Thank you for registering!/);
  assert.doesNotMatch(c.markup(), /QR_pago_WACCI|has been sent|We could not confirm|Please retry or contact/);
  const retry = find(c.render(), node => node.type === 'button' && node.props.children === 'Retry confirmation email');
  await retry.props.onClick();
  assert.match(c.markup(), /has been sent/);
  assert.equal(c.requests.length, 2);
  assert.ok(c.requests[0].receiptBase64);
  assert.equal(c.requests[1].receiptBase64, undefined);
});

test('failed receipt upload keeps payment step and does not claim completion or email delivery', async () => {
  const c = paymentStep([{ ok: false, message: 'Upload failed.' }]);
  await upload(c);
  assert.match(c.markup(), /QR_pago_WACCI|Upload failed/);
  assert.doesNotMatch(c.markup(), /Thank you for registering!|has been sent|Register another person/);
});
