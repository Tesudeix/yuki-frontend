import Image from "next/image";
import sliderImg from "../image/slider.jpeg";

export default function HeroSlider() {
  return (
    <section className="w-full border-b border-neutral-900 bg-black">
      <div className="mx-auto max-w-6xl overflow-hidden px-0 py-0 md:py-4">
        <div className="relative h-[220px] w-full sm:h-[320px] md:h-[420px]">
          <Image
            src={sliderImg}
            alt="Нүүр зураг"
            fill
            priority
            className="object-cover rounded-none md:rounded-xl"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </div>
    </section>
  );
}
