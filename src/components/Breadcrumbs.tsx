import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600" itemScope itemType="https://schema.org/BreadcrumbList">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        {item.href ? (
                            <>
                                <Link
                                    href={item.href}
                                    className="hover:text-blue-600 transition-colors"
                                    itemProp="item"
                                >
                                    <span itemProp="name">{item.label}</span>
                                </Link>
                                <meta itemProp="position" content={String(index + 1)} />
                                {index < items.length - 1 && (
                                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-gray-900 font-medium" itemProp="name">{item.label}</span>
                                <meta itemProp="position" content={String(index + 1)} />
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
