'use client';

import { User, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useUserInfo, useAuth } from '@/contexts/user-context';
import { useState, useRef, useEffect } from 'react';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
}

export function UserAvatar({ size = 'md', showDropdown = true }: UserAvatarProps) {
  const { isAuthenticated } = useAuth();
  const userInfo = useUserInfo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  // Tailles d'avatar
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ redirectTo: '/auth/login' });
  };

  const avatarContent = userInfo.hasImage ? (
    <img
      src={userInfo.image!}
      alt={userInfo.displayName}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-blue-600 font-medium text-white`}
    >
      {userInfo.initials}
    </div>
  );

  if (!showDropdown) {
    return avatarContent;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full ring-2 ring-transparent transition-all hover:ring-blue-200 focus:ring-blue-500 focus:outline-none"
      >
        {avatarContent}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-200">
          {/* En-tête avec infos utilisateur */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0">
                {userInfo.hasImage ? (
                  <img
                    src={userInfo.image!}
                    alt={userInfo.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    {userInfo.initials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {userInfo.displayName}
                </p>
                <p className="truncate text-sm text-gray-500">{userInfo.email}</p>
                {userInfo.hasPhone && (
                  <p className="truncate text-xs text-gray-400">{userInfo.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Options du menu */}
          <div className="py-1">
            <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <User className="h-4 w-4" />
              Mon profil
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Settings className="h-4 w-4" />
              Paramètres
            </button>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-200"></div>

          {/* Déconnexion */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant simple pour afficher juste l'avatar sans dropdown
export function SimpleUserAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <UserAvatar size={size} showDropdown={false} />;
}

// Composant pour afficher les initiales avec le nom à côté
export function UserAvatarWithName() {
  const { isAuthenticated } = useAuth();
  const userInfo = useUserInfo();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <SimpleUserAvatar size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {userInfo.displayName}
        </p>
        <p className="truncate text-xs text-gray-500">{userInfo.role}</p>
      </div>
    </div>
  );
}
