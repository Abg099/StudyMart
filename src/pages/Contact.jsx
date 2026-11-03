import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function Contact() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-brand">
              StudyMart Support
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
              Contact Us
            </h1>
            <p className="mt-4 text-slate-600">
              Have questions or need assistance? We'd love to hear from you.
            </p>
          </div>

          <div className="mt-10 space-y-4 rounded-3xl border bg-white p-6 shadow-sm sm:p-10">

            <a
              href="mailto:abhishekganvir09@gmail.com"
              className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-slate-50"
            >
              <span className="text-3xl">📧</span>
              <div>
                <h2 className="font-bold text-slate-900">Email Us</h2>
                <p className="text-sm text-slate-600">
                  abhishekganvir09@gmail.com
                </p>
              </div>
            </a>

            <a
              href="tel:9579115767"
              className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-slate-50"
            >
              <span className="text-3xl">📞</span>
              <div>
                <h2 className="font-bold text-slate-900">Call Us</h2>
                <p className="text-sm text-slate-600">
                  9579115767
                </p>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/abhishek-ganvir-b0baa7185/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl p-4 transition hover:bg-slate-50"
            >
              <span className="text-3xl">💼</span>
              <div>
                <h2 className="font-bold text-slate-900">LinkedIn Profile</h2>
                <p className="text-sm text-slate-600">
                  Abhishek Ganvir
                </p>
              </div>
            </a>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}