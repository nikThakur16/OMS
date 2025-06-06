
import { type ContactDetailsData } from "@/types/register/page"
import { FormikErrors, FormikTouched } from 'formik';
interface ContactFormProps {
  values: ContactDetailsData;
  errors: FormikErrors<ContactDetailsData>;
  touched: FormikTouched<ContactDetailsData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const Contact:React.FC<ContactFormProps>= ({values, errors, touched, handleChange, handleBlur, setFieldValue}) => {
  return (
    <div className='px-4 bg-white w-full py-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-[#175075] mb-6'>Contact Details</h2>
      <div className='px-4 py-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 w-full'>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="contactDetails.email"
              value={values.email || ''}
              onChange={handleChange}
              onBlur={handleBlur}


              placeholder='eg: email@example.com'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.email && touched.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email as React.ReactNode}</div>
            )}
          </div>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="primaryPhoneNumber"
              name="contactDetails.primaryPhoneNumber"
              value={values.primaryPhoneNumber || ''}  
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='eg: 123-456-7890'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.primaryPhoneNumber && touched.primaryPhoneNumber && (
              <div className="text-red-500 text-sm mt-1">{errors.primaryPhoneNumber as React.ReactNode}</div>
            )}
          </div>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="alt-phone">Alternative Mobile Number (Optional)</label>
            <input
              type="tel"
              id="alternatePhoneNumber"
              name="contactDetails.alternatePhoneNumber"
              value={values.alternatePhoneNumber || ''}
              onChange={handleChange}
              onBlur={handleBlur}

              placeholder='eg: 987-654-3210'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.alternatePhoneNumber && touched.alternatePhoneNumber && (
              <div className="text-red-500 text-sm mt-1">{errors.alternatePhoneNumber as React.ReactNode}</div>
            )}
          </div>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="linkedin">LinkedIn Profile URL (Optional)</label>
            <input
              type="url"
              id="linkedinUrl"
              name="contactDetails.linkedinUrl"
              value={values.linkedinUrl || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='eg: https://www.linkedin.com/in/yourprofile'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.linkedinUrl && touched.linkedinUrl && (
              <div className="text-red-500 text-sm mt-1">{errors.linkedinUrl as React.ReactNode}</div>
            )}
          </div>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="website">Website/Portfolio URL (Optional)</label>
            <input
              type="url"
              id="websiteUrl"
              name="contactDetails.websiteUrl"
              value={values.websiteUrl || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder='eg: https://www.yourwebsite.com'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.websiteUrl && touched.websiteUrl && (
              <div className="text-red-500 text-sm mt-1">{errors.websiteUrl as React.ReactNode}</div>
            )}
          </div>
          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="github">GitHub Profile URL (Optional)</label>
            <input
              type="url"
              id="githubUrl"
              name="contactDetails.githubUrl"
              value={values.githubUrl || ''}
              onChange={handleChange}
              onBlur={handleBlur}

              placeholder='eg: https://github.com/yourusername'
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.githubUrl && touched.githubUrl && (
              <div className="text-red-500 text-sm mt-1">{errors.githubUrl as React.ReactNode}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact