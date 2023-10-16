"use client" 
import * as z from 'zod'
import { Button } from "@/components/ui/button";
import { Billboard} from "@prisma/client"
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/imageUplaod';

const formSchema=z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
})

type BillboardFormValues= z.infer<typeof formSchema>

interface BillboardFormProps {
    initialData: Billboard | null;
};

export const BillboardForm: React.FC<BillboardFormProps> =({initialData})=>{
    const params = useParams();
    const router = useRouter();
    const form = useForm<BillboardFormValues>({
        resolver:zodResolver(formSchema),
        defaultValues: initialData|| {
            label: '',
            imageUrl: ''
        }
    });

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const toastMessage= initialData? "Billboard Updated" : "Billboard Created"
    
    const onSubmit=async(data: BillboardFormValues)=>{
        try {
            setLoading(true)
            if(initialData){
                await axios.patch(`/api/${params.storeId}/billboard/${params.billboardId}`, data)
            }else{
                await axios.post(`/api/${params.storeId}/billboard`, data)
            }
            router.refresh()
            router.push(`/${params.storeId}/billboards`)
            toast.success(toastMessage)
        } catch (error) {
            toast.error("Something went wrong")
        }finally{
            setLoading(false)
        }
    }

    const onDelete=async()=>{
        try {
            setLoading(true)
            await axios.delete(`/api/${params.storeId}/billboard/${params.billboardId}`)
            router.refresh()
            router.push(`/${params.storeId}/billboards`)
            toast.success("BillBoard deleted")
        } catch (error) {
            toast.error("Make sure you removed all categories using this billboard")
        }finally{
            setLoading(false)
            setOpen(false)
        }
    }
    
    return(
        <>
        <AlertModal
            isOpen={open}
            onClose={()=>setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
            <div className="flex items-center justify-between">
                <Heading
                    title={initialData? 'Edit billboard' : 'Create billboard'}
                    description={initialData? 'Edit a billboard' : 'Add a new billboard'}
                />
                {
                    initialData && (
                        <Button
                            disabled={loading}
                            variant="destructive"
                            size="icon"
                            onClick={() => setOpen(true)}
                        >
                            <Trash className="h-4 w-4"/>
                        </Button>
                    )
                }
                
            </div>

            <Separator/>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Background image</FormLabel>
                            <FormControl>
                                <ImageUpload 
                                value={field.value ? [field.value] : []} 
                                disabled={loading} 
                                onChange={(url) => field.onChange(url)}
                                onRemove={() => field.onChange('')}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Billboard label" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button disabled={loading} className="ml-auto" type="submit">
                        {initialData ? 'Save changes' : 'Create'}
                    </Button>
                </form>
            </Form>
        </>
    )
}