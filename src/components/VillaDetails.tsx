'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Phone, Mail, MapPin, User, Building, Home, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedVilla } from '@/types/villas';

interface VillaDetailsProps {
  villa: NormalizedVilla | null;
  isOpen: boolean;
  onClose: () => void;
  onFlyToLocation: () => void;
}

export default function VillaDetails({ villa, isOpen, onClose, onFlyToLocation }: VillaDetailsProps) {
  if (!isOpen || !villa) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md h-[90vh] overflow-hidden"
        >
          <Card className="bg-background/95 backdrop-blur-md border-2 border-secondary/20 shadow-2xl flex flex-col h-full">
            {/* Fixed Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-secondary/20 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                  Villa Details
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-secondary/50">
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </CardHeader>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <CardContent className="space-y-6 p-6">
              {/* Villa Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="text-3xl"
                >
                  <img src="/building.png" alt="Villa" className="w-8 h-8" />
                </motion.div>
                <div className="flex-1">
                  <motion.div 
                    className="font-semibold text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    {villa.Customer_Name}
                  </motion.div>
                  <motion.div 
                    className="text-sm text-textSecondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    Account: {villa.Account_Number}
                  </motion.div>
                </div>
                <motion.span 
                  className="px-3 py-1 rounded-full text-xs font-medium border text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  ACTIVE
                </motion.span>
              </motion.div>

              {/* Villa Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Building className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-textPrimary">Villa Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm bg-primary/30 p-4 rounded-lg">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  >
                    <span className="text-textSecondary">Account ID:</span>
                    <div className="font-medium">{villa.Account_Number}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                  >
                    <span className="text-textSecondary">Status:</span>
                    <div className="font-medium text-green-600">Active</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.3 }}
                    className="col-span-2"
                  >
                    <span className="text-textSecondary">Customer Name:</span>
                    <div className="font-medium">{villa.Customer_Name}</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Location Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-textPrimary">Location Information</span>
                </div>
                <div className="space-y-3 bg-primary/30 p-4 rounded-lg">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.3 }}
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4 text-textSecondary" />
                    <span className="text-textSecondary">City:</span>
                    <span className="font-medium">{villa.City}</span>
                  </motion.div>
                  {villa.Address && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5, duration: 0.3 }}
                      className="flex items-center space-x-2"
                    >
                      <MapPin className="h-4 w-4 text-textSecondary" />
                      <span className="text-textSecondary">Address:</span>
                      <span className="font-medium">{villa.Address}</span>
                    </motion.div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6, duration: 0.3 }}
                    >
                      <span className="text-textSecondary">Latitude:</span>
                      <div className="font-medium">{villa.Latitude.toFixed(6)}</div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.7, duration: 0.3 }}
                    >
                      <span className="text-textSecondary">Longitude:</span>
                      <div className="font-medium">{villa.Longitude.toFixed(6)}</div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              {villa.Email_Address && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9, duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="h-5 w-5 text-white" />
                    </motion.div>
                    <span className="text-sm font-semibold text-textPrimary">Contact Information</span>
                  </div>
                  <div className="space-y-3 bg-primary/30 p-4 rounded-lg">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.0, duration: 0.3 }}
                      className="flex items-center space-x-2"
                    >
                      <Mail className="h-4 w-4 text-textSecondary" />
                      <span className="text-textSecondary">Email:</span>
                      <span className="font-medium">{villa.Email_Address}</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              </CardContent>
            </div>
            
            {/* Fixed Footer */}
            <div className="flex-shrink-0 p-6 pt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.4 }}
                className="flex space-x-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button 
                    onClick={onFlyToLocation}
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-white border-0"
                    variant="outline"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button 
                    onClick={onClose} 
                    className="w-full bg-secondary hover:bg-secondary/80 text-textPrimary"
                  >
                    Close
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 