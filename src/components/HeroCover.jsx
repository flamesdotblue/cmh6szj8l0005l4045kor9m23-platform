import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <div className="relative w-full" style={{ height: '60vh' }}>
      <Spline scene="https://prod.spline.design/qMOKV671Z1CM9yS7/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">Plan, Create, and Attach PDFs to Your Calendar</h1>
          <p className="mt-4 text-neutral-300 max-w-2xl mx-auto">A simple tool to manage your schedule and generate printable documents you can link to events.</p>
        </div>
      </div>
    </div>
  );
}
