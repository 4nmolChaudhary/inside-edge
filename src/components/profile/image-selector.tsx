import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { StaticImageData } from 'next/image'

type ImageSelectorProps = {
  currentIndex: number
  onIndexChange: (index: number) => void
  className?: string
  images: StaticImageData[]
}

export const ImageSelector = ({ currentIndex, onIndexChange, className, images }: ImageSelectorProps) => {
  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    onIndexChange(newIndex)
  }
  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    onIndexChange(newIndex)
  }

  const Control = ({ direction, className }: { direction: 'prev' | 'next'; className?: string }) => (
    <button onClick={direction === 'prev' ? handlePrev : handleNext} className={`flex items-center justify-center p-2 w-1/5 h-full bg-card border-none text-white hover:bg-primary/20 ${className}`}>
      {direction === 'prev' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  )

  return (
    <div className={`w-full flex items-center justify-between gap-4 ${className}`}>
      <Control direction='prev' className={className} />
      <div className='relative w-3/5 overflow-hidden h-full'>
        <Image src={images[currentIndex]} alt={`Avatar ${currentIndex + 1}`} />
      </div>
      <Control direction='next' className={className} />
    </div>
  )
}
