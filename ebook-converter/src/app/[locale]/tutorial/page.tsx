import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tutorial' })
  const prefix = locale === 'es' ? '/es' : ''
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `https://www.bookconv.com${prefix}/tutorial`,
      languages: {
        en: '/tutorial',
        es: '/es/tutorial',
        'x-default': '/tutorial',
      },
    },
  }
}

export default async function TutorialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tutorial' })
  const steps = [
    { title: t('step1Title'), desc: t('step1Desc') },
    { title: t('step2Title'), desc: t('step2Desc') },
    { title: t('step3Title'), desc: t('step3Desc') },
    { title: t('step4Title'), desc: t('step4Desc') },
    { title: t('step5Title'), desc: t('step5Desc') },
  ]
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-center'>{t('title')}</h1>
      <p className='text-lg mb-8 text-center text-gray-600'>{t('subtitle')}</p>

      {/* Video Embed Area - Replace with your video URL */}
      <div className='mb-12 rounded-lg overflow-hidden shadow-md'>
        <iframe
          src='https://www.youtube.com/embed/YOUR_VIDEO_ID'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          className='w-full h-96 md:h-[500px]'
          title={t('videoTitle')}
        ></iframe>
      </div>

      {/* Step-by-step instructions */}
      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>{t('stepByStep')}</h2>

        <div className='space-y-6'>
          {steps.map((step, i) => (
            <div className='flex gap-4' key={step.title}>
              <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold'>{i + 1}</div>
              <div>
                <h3 className='font-semibold text-lg'>{step.title}</h3>
                <p className='text-gray-600'>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='mt-12 p-6 bg-blue-50 rounded-lg'>
        <h3 className='text-xl font-semibold mb-3'>{t('tipsTitle')}</h3>
        <ul className='list-disc list-inside space-y-2 text-gray-700'>
          <li>{t('tip1')}</li>
          <li>{t('tip2')}</li>
          <li>{t('tip3')}</li>
          <li>{t('tip4')}</li>
        </ul>
      </section>

      <div className='mt-8 text-center'>
        <Link href='/' className='btn-primary bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'>{t('goHome')}</Link>
      </div>
    </div>
  )
}
