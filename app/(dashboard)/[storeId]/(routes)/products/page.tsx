import prismadb from "@/lib/prismadb"
import { ProductClient } from "./components/client"
import { ProductColumn } from "./components/columns"
import {format} from 'date-fns'
import { formatter } from "@/lib/utils"

const BillboardPage=async({params}:{params:{storeId: string}})=>{

    const products=await prismadb.product.findMany({
        where:{
            storeId: params.storeId
        },
        include: {
            category: true
        },
        orderBy:{
            createAt:'desc'
        }
    })


    const formattedProducts: ProductColumn[]=products.map((product)=>(
        {
            id: product.id,
            name: product.name,
            isFeatured: product.isFeatured,
            stockOfSmallSize:product.stockOfSmallSize,
            stockOfMediumSize:product.stockOfMediumSize,
            stockOfLargeSize:product.stockOfLargeSize,
            category: product.category.name,
            price: formatter.format(product.price.toNumber()),
            createdAt: format(product.createAt, 'MMMM do, yyyy')
        }
    ))

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductClient data={formattedProducts}/>
            </div>
        </div>
    )
}

export default BillboardPage