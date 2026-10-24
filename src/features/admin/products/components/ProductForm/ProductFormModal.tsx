"use client"

import { Button, Overlay } from '@/components'
import { ReactNode, useEffect } from 'react'
import { FormAction, useProductFormToggle } from '../../provider/ProductFormToggleContext'
import { Plus } from 'lucide-react';

interface ProductFormModalType {
    children: ReactNode,
    className?: string,
}

type ProductFormModalComponent = React.FC<ProductFormModalType> & {
    Open: typeof OpenForm;
    Close: typeof CloseForm;
};

const ProductFormModal = (({ children, className }: ProductFormModalType) => {
    const { isOpen, CloseProductForm } = useProductFormToggle()

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", isOpen);

        return () => {
            document.body.classList.remove("overflow-hidden");
        }
    }, [isOpen])

    return (
        <>
            <Overlay
                className={`z-999  supports-backdrop-filter:backdrop-blur-xs ${isOpen ? "block" : "hidden"}`}
                onClick={CloseProductForm}
            ></Overlay>
            <div
                className={`fixed flex flex-col text-foreground h-dvh gap-4 text-sm inset-y-0 z-1000 w-full md:w-3/5 translate-x-1/2 ${isOpen ? "right-1/2" : "right-[-200%]"} ${className}`}
            >
                {children}
            </div>
        </>
    )
}) as ProductFormModalComponent;

function OpenForm({ children, action, productId }: { children?: ReactNode, action: FormAction, productId?: string }) {
    const { OpenProductForm } = useProductFormToggle();
    return (
        <div className="cursor-pointer" onClick={() => OpenProductForm(action, productId)}>
            {children}
            {action === "add" && <Button className="w-fit"><Plus />Add Product</Button>}
        </div>
    );
}

function CloseForm({ children }: { children: ReactNode }) {
    const { CloseProductForm } = useProductFormToggle();
    return (
        <button onClick={CloseProductForm} className="cursor-pointer">
            {children}
        </button>
    );
}

ProductFormModal.Open = OpenForm;
ProductFormModal.Close = CloseForm

export default ProductFormModal