import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import Image from "next/image"

interface PurchaseHistoryItem {
    id: number
    price: string
    date: string
}

const MainContent: React.FC = () => {
    const purchaseHistory: PurchaseHistoryItem[] = [1, 2, 3].map((item) => ({
        id: item,
        price: `$${(Math.random() * 100).toFixed(2)}`,
        date: new Date().toLocaleDateString(),
    }))

    return (
        <main className="grid gap-6 p-4 md:p-6 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Disponible</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,550.00</div>
                        <p className="text-xs text-muted-foreground">+20% desde el mes pasado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Usuario</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Image
                                src="/placeholder.svg?height=40&width=40"
                                width={40}
                                height={40}
                                alt="Avatar"
                                className="rounded-full"
                            />
                            <div>
                                <div className="font-medium">Juan Pérez</div>
                                <div className="text-xs text-muted-foreground">juan.perez@ejemplo.com</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Compras Recientes</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">3 en camino</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {purchaseHistory.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Producto #{item.id}</div>
                                    <div className="text-sm text-muted-foreground">Comprado el {item.date}</div>
                                </div>
                                <div className="font-medium">{item.price}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

export default MainContent
