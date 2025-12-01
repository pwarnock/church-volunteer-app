import Link from 'next/link';
import { SearchIcon, PlusIcon, ClipboardIcon, ListIcon, ChartIcon, UsersIcon, CogIcon } from './svg-icon';

interface ActionCardProps {
  icon: 'search' | 'plus' | 'clipboard' | 'list' | 'chart' | 'users' | 'cog';
  title: string;
  description: string;
  href: string;
  iconBgColor: string;
  iconColor: string;
  buttonColor: string;
  buttonHoverColor: string;
}

const iconComponents = {
  search: SearchIcon,
  plus: PlusIcon,
  clipboard: ClipboardIcon,
  list: ListIcon,
  chart: ChartIcon,
  users: UsersIcon,
  cog: CogIcon,
};

export function ActionCard({
  icon,
  title,
  description,
  href,
  iconBgColor,
  iconColor,
  buttonColor,
  buttonHoverColor,
}: ActionCardProps) {
  const IconComponent = iconComponents[icon];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <IconComponent className={iconColor} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        <Link
          href={href}
          className={`inline-block ${buttonColor} text-white px-6 py-3 rounded-lg font-semibold ${buttonHoverColor} transition-colors`}
        >
          {getButtonText(title)}
        </Link>
      </div>
    </div>
  );
}

function getButtonText(title: string): string {
  const buttonMappings: Record<string, string> = {
    'Spiritual Gifts Assessment': 'Take Assessment',
    'Browse Opportunities': 'View Opportunities',
    'Create Opportunity': 'Create Opportunity',
    'Manage Opportunities': 'Manage Opportunities',
    'View Applications': 'View Applications',
    'Manage Profile': 'Manage Profile',
    'Settings': 'Settings',
  };

  return buttonMappings[title] || 'Get Started';
}