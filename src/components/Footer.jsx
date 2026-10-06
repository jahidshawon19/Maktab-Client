export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 px-4 mt-auto w-full">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-center sm:text-left text-sm">
          © 2026 Maktab Learning Management System
        </p>
        <p className="text-center text-sm">
          Developed by{' '}
          <a
            href="https://quantlogic.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Jahid Hasan Shawon
          </a>
        </p>
      </div>
    </footer>
  );
}
