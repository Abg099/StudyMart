
import { Link } from "react-router-dom";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { label: "Online shopping", to: "/shop" },
      { label: "Local sellers", to: "/local-sellers" },
      { label: "Student marketplace", to: "/student-marketplace" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms & conditions", to: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">

        {/* Logo and Description */}
        <div>
          <img
  src="/assets/Studylogo.png"
  alt="StudyMart logo"
  className="h-12 w-auto"
/>

          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            A shared marketplace for students, local shops and everyday essentials.
          </p>
        </div>

        {/* Footer Links */}
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="font-bold">{group.title}</h3>

            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    className="transition hover:text-brand"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} StudyMart. Built for students and local communities.
      </div>
    </footer>
  );
}
