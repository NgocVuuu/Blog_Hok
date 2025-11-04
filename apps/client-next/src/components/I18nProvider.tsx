"use client";
import React from 'react';
// import will initialize i18n (side-effect)
import '../i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }){
  return <>{children}</>;
}
