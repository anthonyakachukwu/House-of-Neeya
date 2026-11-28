"use client"

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReactNode } from "react"

const AdminTable = ({ rowHeaders, children }: { rowHeaders: string[] | ReactNode[], children: ReactNode }) => {

    return (
        <>
            <Table className="text-xs!">
                <TableHeader>
                    <TableRow>
                        {
                            rowHeaders.map((header, index) => {
                                return (
                                    <TableHead key={index} className="font-semibold">{header}</TableHead>
                                )
                            })
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        children
                    }
                </TableBody>
            </Table>
        </>

    )
}

export default AdminTable