export default function Home() {
  return (
   <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold text-center">Hi, welcome to naktside.com. Please come back later.</h1>
    <p className="mt-4 text-center">{process.env.GREETING_MESSAGE}</p>
   </div>
  );
}
