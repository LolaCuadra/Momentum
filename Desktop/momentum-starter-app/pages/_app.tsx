import '../styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
console.log('CLERK KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const hideNavbarRoutes = ['/sign-in', '/sign-up']

  return (
    <ClerkProvider {...pageProps}>
      {!hideNavbarRoutes.includes(router.pathname) && <Navbar />}
      <Component {...pageProps} />
    </ClerkProvider>
  )
  
}
