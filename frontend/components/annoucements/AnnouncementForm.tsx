import React from "react";
import { toast } from "react-toastify";
import { useCreateAnnouncementMutation } from "@/store/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AdminAnnouncementToast } from "@/components/toasts/AnnouncementToasts";

const roles = ["Employee", "HR", "Admin", "all"];

type AnnouncementFormValues = {
  title: string;
  message: string;
  targetRoles: string[];
};

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  message: Yup.string().required("Message is required"),
  targetRoles: Yup.array().min(1, "Select at least one target").required(),
});

const AnnouncementCard = () => {
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center min-w-[260px] max-w-[320px]">
      <div className="bg-[#0a466b] rounded-full w-14 h-14 flex items-center justify-center -mt-10 mb-3">
        <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="2">
          <circle cx="16" cy="16" r="14" />
          <path d="M16 22c-4 0-6-2-6-4s2-4 6-4 6 2 6 4-2 4-6 4z" />
          <circle cx="16" cy="12" r="3" />
        </svg>
      </div>
      <h3 className="text-[#0a466b] font-semibold text-lg mb-2">Create Announcement</h3>
      <Formik<AnnouncementFormValues>
        initialValues={{
          title: "",
          message: "",
          targetRoles: [],
        }}
        validationSchema={AnnouncementSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            await createAnnouncement(values).unwrap();
            toast((props) => (
              <AdminAnnouncementToast
                {...props}
                announcement={{
                  title: "Announcement posted successfully!",
                  message: values.title,
                  createdBy: { role: "Admin" }
                }}
              />
            ));
            resetForm();
          } catch (err) {
            toast.error("Failed to post announcement.");
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="w-full">
            <Field
              name="title"
              placeholder="Title"
              className="w-full p-2 mb-2 rounded border border-gray-200 text-sm"
            />
            <ErrorMessage name="title" component="div" className="text-red-500 text-xs mb-2" />

            <Field
              as="textarea"
              name="message"
              placeholder="Message"
              rows={3}
              className="w-full p-2 mb-2 rounded border border-gray-200 text-sm resize-none"
            />
            <ErrorMessage name="message" component="div" className="text-red-500 text-xs mb-2" />

            <div className="mb-2">
              <label className="block font-semibold mb-1">Target Audience:</label>
              <div className="flex gap-4 flex-wrap">
                {roles.map(role => (
                  <label key={role} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="targetRoles"
                      value={role}
                      checked={values.targetRoles.includes(role)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFieldValue("targetRoles", [...values.targetRoles, role]);
                        } else {
                          setFieldValue(
                            "targetRoles",
                            values.targetRoles.filter(r => r !== role)
                          );
                        }
                      }}
                    />
                    {role}
                  </label>
                ))}
              </div>
              <ErrorMessage name="targetRoles" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0a466b] text-white rounded py-2 font-semibold text-sm"
            >
              {isLoading ? "Posting..." : "Post Announcement"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AnnouncementCard;
