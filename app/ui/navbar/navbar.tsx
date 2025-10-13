import Link from 'next/link';
import {BookOpenIcon, CalculatorIcon, UserCircleIcon} from "@heroicons/react/24/outline";

const links = [
    { name: 'Trip Planner', href: '/trip-planner', icon: BookOpenIcon },
    { name: 'Login', href: '/login', icon: UserCircleIcon },
];

export default function Navbar() {
  return (
    <div className="flex flex-row w-full h-[55px] bg-gray-50 ">
      <Link
        className="flex h-auto items-center bg-gray-500"
        href="/"
      >
        <div className="w-40 pr-2 text-right text-white text-xl">
          <p>Travel Planner</p>
        </div>
      </Link>

      <div className="flex grow flex-row justify-end md:flex-row">
          {links.map((link) => {
              const LinkIcon = link.icon;
              return (
                  <Link
                      key={link.name}
                      href={link.href}
                      className="flex  items-center justify-center gap-2  p-3 text-sm font-medium hover:bg-gray-300 md:flex-none md:justify-start md:p-2 md:px-3"
                  >
                      <LinkIcon className="w-6" />
                      <p className="hidden md:block">{link.name}</p>
                  </Link>
              );
          })}
      </div>
    </div>
  );
}
