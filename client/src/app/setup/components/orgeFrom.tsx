"use client";

import { FC, useState } from "react";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button"; // Replace with correct paths to shadcn components
import { Input } from "@/components/ui/input"; // Replace with correct paths to shadcn components
import { Label } from "@/components/ui/label"; // Replace with correct paths to shadcn components
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setToken } from "@/redux/reducer/login";
import { useRouter } from "next/navigation";

// Define form values type
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface OrganizationFormValues {
  name: string;
  domain: string;
  contactEmail: string;
  phone: string;
  address: Address;
}

// Validation Schema
const organizationValidationSchema = Yup.object().shape({
  name: Yup.string().required("Organization name is required"),
  domain: Yup.string()
  .matches(
    /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
    "Enter a valid domain (e.g., google.com)"
  )
  .required("Domain is required"),
  contactEmail: Yup.string().email("Enter a valid email").required("Contact email is required"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Phone number must be numeric")
    .min(10, "Phone number must be at least 10 digits")
    .required("Phone number is required"),
  address: Yup.object().shape({
    street: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    postalCode: Yup.string()
      .matches(/^[0-9]+$/, "Postal code must be numeric")
      .required("Postal code is required"),
  }),
});
const initialValues: OrganizationFormValues = {
  name: "",
  domain: "",
  contactEmail: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
};

interface OrganizationFormProps {
  setProgress: (value: number) => void;
  setActiveTab: (tab: string) => void;
}

const OrganizationForm: FC<OrganizationFormProps> = ({setProgress,  setActiveTab}) => {

  const token = useSelector((state: RootState) => state.login.userToken);
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()  
  const router = useRouter();


  const updateUser = async(token:any,user:any) => {
        token.user = user
        dispatch(setToken(token))
  }




  const onSubmit = async (values: OrganizationFormValues, { resetForm }: FormikHelpers<OrganizationFormValues>) => {
    try {
      // Send data to the backend API
      const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL+'/api/v1/org/add', values,{
        headers: {
          Authorization: `Bearer ${token?.token}`,
        }});
      updateUser(token,response.data?.user)
      setActiveTab("connect-application")
      setProgress(50)
      
      resetForm();
    } catch (error:any) {
      if(error?.status == 401){
        router.replace("/login")
      }
    }
  };

  const formik = useFormik<OrganizationFormValues>({
    initialValues,
    validationSchema: organizationValidationSchema,
    onSubmit: onSubmit,
  });


 


  const { values, handleChange, handleSubmit, errors, touched, handleBlur } = formik;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Name */}
      <div>
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter organization name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.name && errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>

      {/* Domain */}
      <div>
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          name="domain"
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          value={values.domain}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.domain && errors.domain && <p className="text-red-500">{errors.domain}</p>}
      </div>

      {/* Contact Email */}
      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          placeholder="Enter contact email"
          value={values.contactEmail}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.contactEmail && errors.contactEmail && <p className="text-red-500">{errors.contactEmail}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="text"
          placeholder="Enter phone number"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.phone && errors.phone && <p className="text-red-500">{errors.phone}</p>}
      </div>

      {["street", "city", "state", "country", "postalCode"].map((field) => (
        <div key={field} className="flex flex-col space-y-2">
            <Label htmlFor={`address.${field}`}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
            </Label>
            <Input
            id={`address.${field}`}
            name={`address.${field}`}
            type="text"
            placeholder={`Enter ${field}`}
            value={(values.address as any)[field]} // or use type assertion for address
            onChange={handleChange}
            onBlur={handleBlur}
            className="p-2 border rounded-md"
            />
            {touched.address?.[field as keyof Address] && errors.address?.[field as keyof Address] && (
            <p className="text-red-500 text-sm">{(errors.address as any)[field]}</p>
            )}
        </div>
        ))}


      {/* Submit Button */}
      <Button type="submit" className="mt-4">
        Submit
      </Button>
    </form>
  );
};

export default OrganizationForm;
