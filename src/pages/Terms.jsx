import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function Terms() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <article className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <p className="font-bold uppercase tracking-widest text-brand">
            StudyMart
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Last updated: November 1, 2026
          </p>

          <p className="mt-6 leading-7 text-slate-600">
            By accessing or using StudyMart, you agree to follow these
            Terms and Conditions. Please read them carefully before
            using our platform.
          </p>

          <section className="mt-8">
            <h2 className="text-xl font-bold">1. Using StudyMart</h2>
            <p className="mt-3 leading-7 text-slate-600">
              StudyMart provides an online platform for discovering
              educational products, connecting with local sellers and
              buying or selling student-related items.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">2. User Responsibilities</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Users must provide accurate information, maintain the
              security of their accounts and use the platform responsibly.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">3. Online Shopping</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Users should review product descriptions, prices and
              availability before placing orders. Orders are subject
              to the applicable seller and checkout conditions.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">4. Local Sellers</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Local sellers are responsible for accurate product
              information, availability, pricing and arrangements
              made directly with buyers.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">5. Student Marketplace</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Users listing used books, notes and other student items
              must provide honest descriptions and accurate information
              about the condition of their products.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">6. Prohibited Activities</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Users must not post misleading listings, fraudulent
              information, illegal products or content that violates
              the rights of others.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">7. Payments and Refunds</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Payment, cancellation and refund conditions depend on
              the applicable purchase arrangement. Any applicable
              conditions should be communicated before a transaction.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">8. Limitation of Responsibility</h2>
            <p className="mt-3 leading-7 text-slate-600">
              StudyMart is a marketplace platform. Users are responsible
              for verifying product details and exercising care when
              communicating or transacting with other users.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">9. Changes to These Terms</h2>
            <p className="mt-3 leading-7 text-slate-600">
              StudyMart may update these Terms and Conditions when
              necessary. Updated terms will be published on this page.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">10. Contact</h2>
            <p className="mt-3 leading-7 text-slate-600">
              For questions about these terms, contact:
              abhishekganvir09@gmail.com
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}