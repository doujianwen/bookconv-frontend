"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TutorialPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Tutorial</h1>
      <p className='text-lg mb-8 text-center text-gray-600'>Get started with ebook format conversion in seconds</p>

      {/* Video Embed Area - Replace with your video URL */}
      <div className='mb-12 rounded-lg overflow-hidden shadow-md'>
        <iframe
          src='https://www.youtube.com/embed/YOUR_VIDEO_ID'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='w-full h-96 md:h-[500px]'
          title='Demo Video'
        ></iframe>
      </div>

      {/* Step-by-step instructions */}
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Step-by-Step Guide</h2>
        
        <div className='space-y-6'>
          <div className='flex gap-4'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>1</div>
            <div>
              <h3 className='font-semibold text-lg'>Visit the website</h3>
              <p className='text-gray-600'>Open https://www.bookconv.com and go to the home page</p>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>2</div>
            <div>
              <h3 className='font-semibold text-lg'>Select conversion format</h3>
              <p className='text-gray-600'>Select your target format on the home page or navigation bar (e.g., PDF, MOBI, etc.)</p>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>3</div>
            <div>
              <h3 className='font-semibold text-lg'>Upload file</h3>
              <p className='text-gray-600'>Click the upload button and select your ebook file (supports EPUB, AZW3, MOBI, etc.)</p>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>4</div>
            <div>
              <h3 className='font-semibold text-lg'>Wait for conversion</h3>
              <p className='text-gray-600'>The system will start converting automatically; progress is displayed in real time (no registration required)</p>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>5</div>
            <div>
              <h3 className='font-semibold text-lg'>Download result</h3>
              <p className='text-gray-600'>After conversion completes, click the download button to save your file</p>
            </div>
          </div>
        </div>
      </section>

      <section className='mt-12 p-6 bg-blue-50 rounded-lg'>
        <h3 className='text-xl font-semibold mb-3'>Tips</h3>
        <ul className='list-disc list-inside space-y-2 text-gray-700'>
          <li>Maximum file size supported: 10MB</li>
          <li>All files are automatically deleted after 1 hour to protect privacy</li>
          <li>Drag-and-drop upload supported for convenience</li>
          <li>For any questions, contact online customer service or view help documentation at any time</li>
        </ul>
      </section>

      <div className='mt-8 text-center'>
        <Link href='/' className='btn-primary bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'>Go Home</Link>
      </div>
    </div>
  )
}
