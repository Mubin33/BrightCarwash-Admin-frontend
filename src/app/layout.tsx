import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { StoreProvider } from '@/app/StoreProvider';
import { SocketProvider } from '@/context/SocketContext';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: 'Bright Car Wash Admin',
	description: 'Premium Car Wash Administration Dashboard',
	icons: {
		icon: '/images/logo.png',
	},
	openGraph: {
		title: 'Bright Car Wash Admin',
		description: 'Premium Car Wash Administration Dashboard',
		images: [
			{
				url: '/images/logo.png',
				width: 512,
				height: 512,
				alt: 'Bright Car Wash',
			},
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' className={inter.variable}>
			<body className={inter.className}>
				<SocketProvider>
				<StoreProvider>{children}</StoreProvider>
				<ToastContainer
					position='top-right'
					autoClose={3000}
					hideProgressBar={false}
				/>
				</SocketProvider>
			</body>
		</html>
	);
}