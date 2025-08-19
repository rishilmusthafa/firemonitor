'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface CounterCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'accent' | 'alert' | 'maintenance';
  'data-testid'?: string;
}

const variantStyles = {
  primary: 'text-textPrimary',
  secondary: 'text-textPrimary',
  accent: 'text-primary',
  alert: 'text-alert',
  maintenance: 'text-maintenance',
};

export default function CounterCard({ title, value, icon, variant, ...props }: CounterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      <Card className={`${variantStyles[variant]} transition-all duration-200 min-w-[220px] w-full rounded-2xl bg-gradient-to-br from-[#616563] to-transparent shadow-[0_4px_55.7px_0_rgba(0,0,0,0.70)] border-0`}>
        <CardContent className="p-5">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="text-3xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
            >
              {icon}
            </motion.div>
            <div className="flex-1">
              <motion.div 
                className="text-sm font-medium text-textSecondary mb-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {title}
              </motion.div>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {value}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 