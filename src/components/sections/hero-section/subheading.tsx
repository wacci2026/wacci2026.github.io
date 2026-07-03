type PropsType = {
 text: string;
};

export function Subheading({ text }: PropsType) {
 return (
 <div className="animate-fade-up rounded-full mb-4 max-w-fit mx-auto bg-linear-to-r from-[#073A4B80] to-[#3f879a80] p-0.5 sm:mb-6">
 <div className="bg-white py-2.5 text-lg font-bold leading-none text-primary-500 items-center px-6 inline-flex rounded-full sm:text-lg sm:px-8 lg:text-xl lg:px-10">
 <p>{text}</p>
 </div>
 </div>
 );
}
