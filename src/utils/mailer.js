const getConfiguration = () => {
  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const missing = [
    ["VITE_EMAILJS_SERVICE_ID", serviceID],
    ["VITE_EMAILJS_TEMPLATE_ID", templateID],
    ["VITE_EMAILJS_PUBLIC_KEY", publicKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(
      `Contact delivery is not configured. Missing: ${missing.join(", ")}`,
    );
  }
  return { serviceID, templateID, publicKey };
};

const sendTemplate = async (
  serviceID,
  templateID,
  templateParams,
  publicKey,
) => {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lib_version: "4.4.1",
      user_id: publicKey,
      service_id: serviceID,
      template_id: templateID,
      template_params: templateParams,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(
      text || `EmailJS request failed (${response.status})`,
    );
    error.status = response.status;
    error.text = text;
    throw error;
  }
  return { status: response.status, text };
};

export const sendContactForm = async (form) => {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const autoReplyTemplateID = import.meta.env
    .VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID;
  const templateParams = Object.fromEntries(new FormData(form));
  templateParams.from_name = templateParams.from_name.trim();
  templateParams.from_email = templateParams.from_email.trim();
  templateParams.reply_to = templateParams.from_email;
  templateParams.message = templateParams.message.trim();
  await sendTemplate(serviceID, templateID, templateParams, publicKey);

  if (!autoReplyTemplateID) {
    return { autoReplyConfigured: false, autoReplySent: false };
  }

  try {
    await sendTemplate(
      serviceID,
      autoReplyTemplateID,
      templateParams,
      publicKey,
    );
    return { autoReplyConfigured: true, autoReplySent: true };
  } catch {
    return { autoReplyConfigured: true, autoReplySent: false };
  }
};

export default async function mail({ name, email, message }) {
  const { serviceID, templateID, publicKey } = getConfiguration();
  return sendTemplate(
    serviceID,
    templateID,
    { name, email, message },
    publicKey,
  );
}
