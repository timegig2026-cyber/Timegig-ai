import React from 'react';
import { Users, CircleUserRound, Compass } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomMenuBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomMenuBar: React.FC<BottomMenuBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return null;
};
