export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <h2>File Handling</h2>
        <p>All uploaded files are encrypted during transfer and automatically deleted within 1 hour of conversion. We do not store, read, or share your content.</p>
        <h2>Data Collection</h2>
        <p>We only collect minimal data necessary for service operation: file names and conversion types. No personal information is collected without consent.</p>
        <h2>Cookies</h2>
        <p>This site does not use cookies for tracking purposes.</p>
        <p className="text-sm text-gray-500 mt-8">Last updated: July 11, 2026</p>
      </div>
    </main>
  )
}
