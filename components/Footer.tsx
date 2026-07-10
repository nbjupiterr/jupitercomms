export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-text-secondary text-sm">
          &copy; {new Date().getFullYear()} Aurora Chen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
