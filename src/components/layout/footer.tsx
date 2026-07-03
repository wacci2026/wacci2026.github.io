import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-5 py-14 text-white">
      <Image
        src="/images/footer/footer.webp"
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover opacity-30"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#073A4B]/30" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
        <Image
          src="/images/wacci-122x64.png"
          alt="WACCI"
          width={122}
          height={64}
          className="h-16 w-auto"
        />

        <p className="text-base font-medium text-gray-900">
          Contact - wacci2026@gmail.com
        </p>
        <p className="text-sm text-gray-900/80">
          Copyright WACCI 2026 - All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
