import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders={
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
    try {
        return NextResponse.json({}, { headers: corsHeaders });
    } catch (error) {
        console.log(error)
    }
    
}

export async function POST(req:Request, {params}: {params: { storeId: string }}) {
    const { items } = await req.json()

    if (!items || items.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 })
    }
    
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[]=[]

    items.forEach((orderItem: any) => {
        const product = orderItem.product
        line_items.push({
            quantity: orderItem.num,
            price_data:{
                currency:'EUR',
                product_data:{
                    name:product.name,
                    metadata: {
                        size: orderItem.size,
                    },
                },
                unit_amount:product.price*100
            }
        })
    })

    const order= await prismadb.order.create({
        data:{
            storeId: params.storeId,
            isPaid:false,
            orderItems:{
                create:items.map((orderItem: any)=>({
                    product:{
                        connect:{
                            id: orderItem.product.id
                        }
                    },
                    size: orderItem.size,
                    num: orderItem.num,
                }))
            }
        }
    })

    const session= await stripe.checkout.sessions.create({
        line_items,
        mode:'payment',
        billing_address_collection:'required',
        phone_number_collection:{
            enabled:true
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url:`${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata:{
            orderId: order.id
        }
    })

    return NextResponse.json({url: session.url},{
        headers:corsHeaders
    })
}
  