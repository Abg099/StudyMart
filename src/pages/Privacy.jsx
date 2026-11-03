import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function Privacy() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <article className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <p className="font-bold uppercase tracking-widest text-brand">
            StudyMart
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Last updated: November 1, 2026
          </p>

          <p className="mt-6 leading-7 text-slate-600">
            StudyMart respects your privacy. This Privacy Policy explains
            what information may be collected and how it is used when
            you use our platform.
          </p>

          <section className="mt-8">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p className="mt-3 leading-7 text-slate-600">
              We may collect information such as your name, email address,
              account details, contact information and information you
              provide when creating product or student marketplace listings.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Your information may be used to manage accounts, display
              listings, process orders, communicate with users and improve
              StudyMart services.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">3. Marketplace Information</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Information included in product listings, seller details
              and student marketplace posts may be visible to other users
              so they can discover and contact sellers.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">4. Third-Party Services</h2>
            <p className="mt-3 leading-7 text-slate-600">
              StudyMart uses third-party services, including Supabase,
              to support application functionality such as authentication
              and data storage. Their own privacy policies and practices
              also apply.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">5. Data Security</h2>
            <p className="mt-3 leading-7 text-slate-600">
              We aim to protect user information through appropriate
              security practices. However, no online platform can
              guarantee absolute security.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">6. Your Privacy Rights</h2>
            <p className="mt-3 leading-7 text-slate-600">
              If you have questions about your information or wish to
              request access, correction or deletion, contact us.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">7. Contact Us</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Email: abhishekganvir09@gmail.com
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}