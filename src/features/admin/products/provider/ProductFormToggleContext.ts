"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type FormAction = "add" | "edit";

type ProductFormContextType = {
  action: FormAction;
  productId: string | null;
  OpenProductForm: (form: FormAction, productId?: string) => void;
  CloseProductForm: () => void;
  isOpen: boolean;
};

const ProductFormContext = createContext<ProductFormContextType>({
  action: "add",
  productId: null,
  OpenProductForm: () => {},
  CloseProductForm: () => {},
  isOpen: false,
});

export const ProductFormProvider = ({ children }: { children: ReactNode }) => {
  const [action, setAction] = useState<FormAction>("add");
  const [productId, setProductId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const OpenProductForm = (form: FormAction, id?: string) => {
    setAction(form);
    setProductId(form === "edit" ? (id ?? null) : null);
    setIsOpen(true);
  };
  const CloseProductForm = () => setIsOpen(false);

  return React.createElement(
    ProductFormContext.Provider,
    {
      value: {
        action,
        productId,
        OpenProductForm,
        CloseProductForm,
        isOpen,
      },
    },
    children,
  );
};

export const useProductFormToggle = () => useContext(ProductFormContext);
