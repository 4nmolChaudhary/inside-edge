import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { PROFILE_IMAGES } from '@/constants/images'

type ImageSelectorProps = {
  currentIndex: number
  onIndexChange: (index: number) => void
  className?: string
}

export const ImageSelector = ({ currentIndex, onIndexChange, className }: ImageSelectorProps) => {
  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : PROFILE_IMAGES.length - 1
    onIndexChange(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < PROFILE_IMAGES.length - 1 ? currentIndex + 1 : 0
    onIndexChange(newIndex)
  }

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button onClick={handlePrev} className='p-2 bg-transparent border-none text-white hover:bg-primary/20'>
        <ChevronLeft size={24} />
      </button>
      <div className='relative w-32 h-32'>
        <Image src={PROFILE_IMAGES[currentIndex]} alt={`Avatar ${currentIndex + 1}`} fill className='object-cover' />
      </div>
      <button onClick={handleNext} className='p-2 bg-transparent border-none text-white hover:bg-primary/20'>
        <ChevronRight size={24} />
      </button>
    </div>
  )
}
