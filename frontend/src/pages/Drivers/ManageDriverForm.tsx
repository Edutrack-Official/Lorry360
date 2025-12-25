// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useNavigate, useParams } from "react-router-dom";
// import FloatingInput from "../../components/FloatingInput";
// import { Users, MapPin, Phone, IndianRupee } from "lucide-react";
// import api from "../../api/client";
// import BackButton from "../../components/BackButton";

// interface FormData {
//   name: string;
//   phone: string;
//   address: string;
//   salary_per_duty: number;
//   salary_per_trip: number;
//   status: "active" | "inactive";
// }

// interface FormErrors {
//   name?: string;
//   phone?: string;
//   address?: string;
//   salary_per_duty?: string;
//   salary_per_trip?: string;
//   salary?: string;
// }

// const initialFormData: FormData = {
//   name: "",
//   phone: "+91-",
//   address: "",
//   salary_per_duty: 0,
//   salary_per_trip: 0,
//   status: "active",
// };

// const ManageDriverForm: React.FC = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<FormData>(initialFormData);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const isEditMode = Boolean(id);

//   useEffect(() => {
//     if (isEditMode) {
//       setLoading(true);
//       api
//         .get(`/drivers/${id}`)
//         .then((res) => {
//           const driverData = res.data.data;
//           setFormData({
//             name: driverData.name || "",
//             phone: driverData.phone || "+91-",
//             address: driverData.address || "",
//             salary_per_duty: driverData.salary_per_duty || 0,
//             salary_per_trip: driverData.salary_per_trip || 0,
//             status: driverData.status || "active",
//           });
//         })
//         .catch((error) => {
//           toast.error(error.response?.data?.error || "Failed to fetch driver details");
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [id, isEditMode]);

//   const validate = (): boolean => {
//     const newErrors: FormErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     } else if (formData.name.length < 3) {
//       newErrors.name = "Name must be at least 3 characters";
//     }

//     if (!formData.phone.trim()) {
//       newErrors.phone = "Phone number is required";
//     } else if (!/^\+91-?\d{10}$/.test(formData.phone)) {
//       newErrors.phone = "Phone must be in format +91-xxxxxxxxxx";
//     }

//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required";
//     }

//     // Validate that at least one salary type is provided
//     if ((!formData.salary_per_duty || formData.salary_per_duty <= 0) &&
//       (!formData.salary_per_trip || formData.salary_per_trip <= 0)) {
//       newErrors.salary = "At least one salary type must be provided";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;

//     if (name === "phone") {
//       // Auto-format phone number
//       let formattedValue = value;

//       if (!formattedValue.startsWith("+91-")) {
//         formattedValue = "+91-" + formattedValue.replace(/\+91-?/g, "");
//       }

//       const digits = formattedValue.slice(4).replace(/\D/g, "").slice(0, 10);
//       formattedValue = "+91-" + digits;

//       setFormData((prev) => ({
//         ...prev,
//         [name]: formattedValue,
//       }));
//     } else if (name === "salary_per_duty" || name === "salary_per_trip") {
//       // Only allow numbers
//       const numericValue = value.replace(/\D/g, "");
//       setFormData((prev) => ({
//         ...prev,
//         [name]: numericValue ? parseInt(numericValue) : 0,
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }

//     if (errors[name as keyof FormErrors]) {
//       setErrors((prev) => ({ ...prev, [name]: undefined }));
//     }

//     // Clear salary error when user starts typing in either field
//     if ((name === "salary_per_duty" || name === "salary_per_trip") && errors.salary) {
//       setErrors((prev) => ({ ...prev, salary: undefined }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setSubmitting(true);
//     try {
//       if (isEditMode) {
//         await api.put(`/drivers/update/${id}`, formData);
//         toast.success("Driver updated successfully");
//       } else {
//         await api.post("/drivers/create", formData);
//         toast.success("Driver created successfully");
//         setFormData(initialFormData);
//       }
//       navigate("/drivers");
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || "Operation failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const formatSalary = (salary: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(salary);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 space-y-6">
//       {/* Header section */}
//       <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-4">
//         <BackButton />
//         <div>
//           <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
//             {isEditMode ? "Edit Driver" : "Add Driver"}
//           </h2>
//           <p className="text-xs text-gray-500 mt-0.5">
//             {isEditMode ? "Update driver information" : "Add a new driver to your fleet"}
//           </p>
//         </div>
//       </div>
//       {/* Form section */}
//       <div className="bg-white rounded-b-xl shadow-md p-8">
//         <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Personal Information */}
//             <div className="md:col-span-2">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                 <Users className="w-5 h-5 text-blue-600" />
//                 Driver Information
//               </h3>
//             </div>

//             {/* Name */}
//             <div>
//               <FloatingInput
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 label="Full Name *"
//               />
//               {errors.name && (
//                 <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div>
//               <FloatingInput
//                 type="text"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 label="Phone *"
//               />
//               {errors.phone && (
//                 <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//               )}
//             </div>

//             {/* Salary per Duty */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Salary per Duty
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="salary_per_duty"
//                   value={formData.salary_per_duty || ""}
//                   onChange={handleChange}
//                   placeholder="Enter salary per duty"
//                   className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 />
//                 <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//               </div>
//             </div>

//             {/* Salary per Trip */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Salary per Trip
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="salary_per_trip"
//                   value={formData.salary_per_trip || ""}
//                   onChange={handleChange}
//                   placeholder="Enter salary per trip"
//                   className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 />
//                 <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//               </div>
//             </div>

//             {/* Salary Validation Error */}
//             {errors.salary && (
//               <div className="md:col-span-2">
//                 <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
//                   {errors.salary}
//                 </p>
//               </div>
//             )}

//             {/* Salary Summary */}
//             {(formData.salary_per_duty > 0 || formData.salary_per_trip > 0) && (
//               <div className="md:col-span-2">
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <h4 className="font-medium text-blue-800 mb-2">Salary Summary</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     {formData.salary_per_duty > 0 && (
//                       <div className="flex gap-2 items-center">
//                         <span className="text-blue-700">Per Duty:</span>
//                         <span className="font-semibold text-blue-800">
//                           {formatSalary(formData.salary_per_duty)}
//                         </span>
//                       </div>
//                     )}
//                     {formData.salary_per_trip > 0 && (
//                       <div className="flex gap-2 items-center">
//                         <span className="text-blue-700">Per Trip:</span>
//                         <span className="font-semibold text-blue-800">
//                           {formatSalary(formData.salary_per_trip)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Address */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Address *
//               </label>
//               <textarea
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 placeholder="Enter complete address"
//               />
//               {errors.address && (
//                 <p className="mt-1 text-sm text-red-600">{errors.address}</p>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
//             >
//               {submitting ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   {isEditMode ? "Updating..." : "Creating..."}
//                 </>
//               ) : (
//                 <>
//                   <Users className="w-4 h-4 mr-2" />
//                   {isEditMode ? "Update Driver" : "Create Driver"}
//                 </>
//               )}
//             </button>

//             <button
//               type="button"
//               onClick={() => navigate("/drivers")}
//               className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ManageDriverForm;

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import FloatingInput from "../../components/FloatingInput";
import { Users, MapPin, Phone, IndianRupee, Mic, MicOff, Volume2, MessageSquare, Play, StopCircle } from "lucide-react";
import api from "../../api/client";
import BackButton from "../../components/BackButton";

// Add SpeechRecognition type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface FormData {
  name: string;
  phone: string;
  address: string;
  salary_per_duty: number;
  salary_per_trip: number;
  status: "active" | "inactive";
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  salary_per_duty?: string;
  salary_per_trip?: string;
  salary?: string;
}

// Voice Assistant Types
type VoiceAssistantState = 'idle' | 'asking' | 'listening' | 'processing' | 'error';

interface VoiceMessage {
  speaker: 'assistant' | 'user';
  message: string;
  timestamp: Date;
}

interface QuestionStep {
  field: keyof FormData;
  label: string;
  question: string;
  validation?: (value: string) => boolean;
  format?: (value: string) => string | number;
}

const initialFormData: FormData = {
  name: "",
  phone: "+91-",
  address: "",
  salary_per_duty: 0,
  salary_per_trip: 0,
  status: "active",
};

const ManageDriverForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Voice Assistant State
  const [assistantState, setAssistantState] = useState<VoiceAssistantState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<VoiceMessage[]>([
    {
      speaker: 'assistant',
      message: 'Hello! I can help you fill out the driver form. Would you like to start?',
      timestamp: new Date()
    }
  ]);
  const [userResponse, setUserResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isEditMode = Boolean(id);

  // Question steps for voice assistant
  const questionSteps: QuestionStep[] = [
    {
      field: 'name',
      label: 'Driver Name',
      question: 'What is the driver\'s full name?',
      validation: (value) => value.length >= 3
    },
    {
      field: 'phone',
      label: 'Phone Number',
      question: 'What is the driver\'s phone number? Say the 10 digits after +91.',
      validation: (value) => /^\d{10}$/.test(value),
      format: (value) => {
        // Extract only digits
        const digits = value.replace(/\D/g, '').slice(0, 10);
        return `+91-${digits}`;
      }
    },
    {
      field: 'address',
      label: 'Address',
      question: 'What is the driver\'s address?',
      validation: (value) => value.length > 0
    },
    {
      field: 'salary_per_duty',
      label: 'Salary per Duty',
      question: 'What is the salary per duty in rupees? If not applicable, say "zero" or "skip".',
      format: (value) => {
        if (value.toLowerCase().includes('skip') || value.toLowerCase().includes('zero') || value === '0') {
          return 0;
        }
        // Extract numbers from speech
        const match = value.match(/\d+/g);
        return match ? parseInt(match.join('')) : 0;
      }
    },
    {
      field: 'salary_per_trip',
      label: 'Salary per Trip',
      question: 'What is the salary per trip in rupees? If not applicable, say "zero" or "skip".',
      format: (value) => {
        if (value.toLowerCase().includes('skip') || value.toLowerCase().includes('zero') || value === '0') {
          return 0;
        }
        // Extract numbers from speech
        const match = value.match(/\d+/g);
        return match ? parseInt(match.join('')) : 0;
      }
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    const checkVoiceSupport = () => {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasSynthesis = 'speechSynthesis' in window;
      setIsVoiceSupported(hasRecognition && hasSynthesis);
      
      if (hasRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';
        recognitionRef.current.maxAlternatives = 3;

        recognitionRef.current.onstart = () => {
          console.log("Voice recognition started");
          setAssistantState('listening');
          startSilenceTimer();
        };

        recognitionRef.current.onresult = (event: any) => {
          clearSilenceTimer();
          
          const lastResultIndex = event.results.length - 1;
          const transcript = event.results[lastResultIndex][0].transcript.trim();
          
          setUserResponse(transcript);
          
          if (event.results[lastResultIndex].isFinal) {
            handleUserResponse(transcript);
            startSilenceTimer();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'no-speech') {
            // Ask again if no speech detected
            if (currentStep < questionSteps.length) {
              speakQuestion(questionSteps[currentStep].question);
            }
            return;
          }
          setAssistantState('error');
          addToConversation('assistant', 'Sorry, I encountered an error. Please try again.');
          setTimeout(() => {
            stopVoiceRecognition();
          }, 2000);
        };

        recognitionRef.current.onend = () => {
          console.log("Voice recognition ended");
          clearSilenceTimer();
          if (assistantState === 'listening') {
            setAssistantState('processing');
          }
        };
      }
    };

    checkVoiceSupport();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      clearSilenceTimer();
    };
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/drivers/${id}`)
        .then((res) => {
          const driverData = res.data.data;
          setFormData({
            name: driverData.name || "",
            phone: driverData.phone || "+91-",
            address: driverData.address || "",
            salary_per_duty: driverData.salary_per_duty || 0,
            salary_per_trip: driverData.salary_per_trip || 0,
            status: driverData.status || "active",
          });
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || "Failed to fetch driver details");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Voice timer functions
  const startSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      addToConversation('assistant', "I didn't hear anything. Please speak your answer.");
      speakQuestion("I didn't hear anything. Please speak your answer.");
    }, 8000);
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Speech synthesis functions
  const speakQuestion = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setAssistantState('asking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      startVoiceRecognition();
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      setAssistantState('listening');
      startVoiceRecognition();
    };
    
    // Try to find an Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => 
      voice.lang.includes('en-IN') || voice.lang.includes('en_IN')
    );
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Voice recognition control
  const startVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not available");
      return;
    }

    try {
      setUserResponse('');
      setAssistantState('listening');
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      toast.error("Failed to start voice input");
      setAssistantState('error');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && assistantState === 'listening') {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAssistantState('idle');
    setIsSpeaking(false);
    clearSilenceTimer();
  };

  // Conversation management
  const addToConversation = (speaker: 'assistant' | 'user', message: string) => {
    setConversation(prev => [...prev, {
      speaker,
      message,
      timestamp: new Date()
    }]);
  };

  // Handle user responses
// Replace the handleUserResponse function with this corrected version:

// Handle user responses
const handleUserResponse = (response: string) => {
  addToConversation('user', response);
  
  // Check for special commands
  if (processSpecialCommand(response)) {
    return;
  }

  if (currentStep >= questionSteps.length) {
    // All questions answered
    addToConversation('assistant', 'Thank you! All information has been collected. Would you like to submit the form?');
    speakQuestion('Thank you! All information has been collected. Would you like to submit the form?');
    return;
  }

  const currentQuestion = questionSteps[currentStep];
  
  // IMPORTANT: Set processing state immediately
  setAssistantState('processing');
  
  console.log(`Processing response for field: ${currentQuestion.field}, Response: "${response}"`);

  // Process response based on field
  let processedValue: string | number = response;
  let isValid = true;
  let errorMessage = '';

  if (currentQuestion.field === 'name') {
    // For name field
    if (currentQuestion.validation && !currentQuestion.validation(response)) {
      isValid = false;
      errorMessage = 'Please provide a name with at least 3 characters.';
    } else {
      processedValue = response;
      console.log(`Name processed: ${processedValue}`);
    }
  } else if (currentQuestion.field === 'phone') {
    // For phone field
    console.log(`Processing phone response: "${response}"`);
    
    // Extract only digits from response
    const digits = response.replace(/\D/g, '');
    console.log(`Extracted digits: ${digits}`);
    
    if (digits.length === 10) {
      processedValue = currentQuestion.format?.(digits) || `+91-${digits}`;
      console.log(`Phone processed: ${processedValue}`);
    } else {
      isValid = false;
      errorMessage = `Please provide a valid 10-digit phone number. You said: "${response}". Only got ${digits.length} digits.`;
      console.log(`Phone validation failed: ${errorMessage}`);
    }
  } else if (currentQuestion.field === 'address') {
    // For address field
    if (currentQuestion.validation && !currentQuestion.validation(response)) {
      isValid = false;
      errorMessage = 'Please provide a valid address.';
    } else {
      processedValue = response;
      console.log(`Address processed: ${processedValue}`);
    }
  } else if (currentQuestion.field === 'salary_per_duty' || currentQuestion.field === 'salary_per_trip') {
    // For salary fields
    console.log(`Processing salary response: "${response}"`);
    processedValue = currentQuestion.format?.(response) || 0;
    if (processedValue === 0) {
      // User said "skip" or "zero"
      console.log(`Salary set to 0 for ${currentQuestion.field}`);
    }
    console.log(`Salary processed: ${processedValue}`);
  }

  if (isValid && currentQuestion) {
    // Update form data
    console.log(`Updating form field "${currentQuestion.field}" with value: "${processedValue}"`);
    
    setFormData(prev => ({
      ...prev,
      [currentQuestion.field]: processedValue
    }));

    addToConversation('assistant', `${currentQuestion.label}: ${processedValue}`);

    // Move to next question after a brief delay
    setTimeout(() => {
      const nextStep = currentStep + 1;
      console.log(`Moving from step ${currentStep} to step ${nextStep}`);
      setCurrentStep(nextStep);
      
      if (nextStep < questionSteps.length) {
        // IMPORTANT: Wait for state to update before asking next question
        setTimeout(() => {
          askQuestion(nextStep);
        }, 500);
      } else {
        // All questions answered
        addToConversation('assistant', 'All information collected! The form is ready. Say "submit" to save or "review" to check the details.');
        speakQuestion('All information collected! The form is ready. Say "submit" to save or "review" to check the details.');
      }
    }, 1000);
  } else {
    // Ask the question again with error message
    setTimeout(() => {
      const retryMessage = errorMessage || `I didn't understand that. ${currentQuestion.question}`;
      console.log(`Asking again: ${retryMessage}`);
      addToConversation('assistant', retryMessage);
      speakQuestion(retryMessage);
    }, 1000);
  }
};



  // Start asking questions
  const startVoiceAssistant = () => {
    if (!isVoiceSupported) {
      toast.error("Voice features not supported in your browser");
      return;
    }

    setAssistantState('asking');
    setCurrentStep(0);
    setConversation([
      {
        speaker: 'assistant',
        message: 'Hello! I will guide you through filling the driver form. Let\'s start with the first question.',
        timestamp: new Date()
      }
    ]);
    
    // Start with first question
    askQuestion(0);
  };
const askQuestion = (stepIndex: number) => {
  if (stepIndex < questionSteps.length) {
    const question = questionSteps[stepIndex];
    // Remove or update the console.log line if it's causing issues
    console.log(`Asking question ${stepIndex}: ${question.field} - ${question.question}`);
    addToConversation('assistant', question.question);
    speakQuestion(question.question);
  }
};

  // Handle special commands
  const processSpecialCommand = (command: string): boolean => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('go back') || lowerCommand.includes('previous')) {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        askQuestion(currentStep - 1);
      }
      return true;
    }
    
    if (lowerCommand.includes('skip') || lowerCommand.includes('next')) {
      if (currentStep < questionSteps.length) {
        setCurrentStep(currentStep + 1);
        askQuestion(currentStep + 1);
      }
      return true;
    }
    
    if (lowerCommand.includes('start over') || lowerCommand.includes('restart')) {
      startVoiceAssistant();
      return true;
    }
    
    if (lowerCommand.includes('submit') || lowerCommand.includes('save')) {
      addToConversation('assistant', 'Submitting the form...');
      // Trigger form submission
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.click();
      }
      return true;
    }
    
    if (lowerCommand.includes('review') || lowerCommand.includes('check')) {
      const reviewMessage = `Let me review what you've entered: Name: ${formData.name}, Phone: ${formData.phone}, Address: ${formData.address}, Salary per Duty: ₹${formData.salary_per_duty}, Salary per Trip: ₹${formData.salary_per_trip}. Say "continue" to proceed or "make changes" to edit.`;
      addToConversation('assistant', reviewMessage);
      speakQuestion(reviewMessage);
      return true;
    }
    
    if (lowerCommand.includes('stop') || lowerCommand.includes('cancel')) {
      addToConversation('assistant', 'Voice assistant stopped. You can continue manually.');
      stopVoiceRecognition();
      return true;
    }
    
    return false;
  };

  // Rest of your existing functions (validate, handleChange, handleSubmit, formatSalary) remain the same
// Update the phone validation in the validate function:
const validate = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  } else if (formData.name.length < 3) {
    newErrors.name = "Name must be at least 3 characters";
  }

  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  } else {
    // Extract only digits and check if we have 10 digits
    const digits = formData.phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      newErrors.phone = "Phone must contain exactly 10 digits";
    }
  }

  if (!formData.address.trim()) {
    newErrors.address = "Address is required";
  }

  // Validate that at least one salary type is provided
  if ((!formData.salary_per_duty || formData.salary_per_duty <= 0) &&
    (!formData.salary_per_trip || formData.salary_per_trip <= 0)) {
    newErrors.salary = "At least one salary type must be provided";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Auto-format phone number
      let formattedValue = value;

      if (!formattedValue.startsWith("+91-")) {
        formattedValue = "+91-" + formattedValue.replace(/\+91-?/g, "");
      }

      const digits = formattedValue.slice(4).replace(/\D/g, "").slice(0, 10);
      formattedValue = "+91-" + digits;

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else if (name === "salary_per_duty" || name === "salary_per_trip") {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue ? parseInt(numericValue) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear salary error when user starts typing in either field
    if ((name === "salary_per_duty" || name === "salary_per_trip") && errors.salary) {
      setErrors((prev) => ({ ...prev, salary: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/drivers/update/${id}`, formData);
        toast.success("Driver updated successfully");
      } else {
        await api.post("/drivers/create", formData);
        toast.success("Driver created successfully");
        setFormData(initialFormData);
      }
      navigate("/drivers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header section */}
      <div className="bg-white p-5 rounded-t-xl border shadow-md flex items-center gap-4">
        <BackButton />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Driver" : "Add Driver"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode ? "Update driver information" : "Add a new driver to your fleet"}
          </p>
        </div>
      </div>

      {/* Voice Assistant Section */}
      <div className="bg-white rounded-xl border shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            Voice Assistant
          </h3>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${
              assistantState === 'listening' ? 'bg-green-500 animate-pulse' : 
              assistantState === 'asking' ? 'bg-blue-500' : 
              assistantState === 'processing' ? 'bg-yellow-500' : 
              'bg-gray-300'
            }`}></span>
            <span className="text-sm text-gray-600">
              {assistantState === 'idle' ? 'Ready' :
               assistantState === 'asking' ? 'Asking...' :
               assistantState === 'listening' ? 'Listening...' :
               assistantState === 'processing' ? 'Processing...' :
               'Error'}
            </span>
          </div>
        </div>

        {/* Voice Assistant Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {isVoiceSupported ? (
            <>
              <button
                type="button"
                onClick={startVoiceAssistant}
                disabled={assistantState !== 'idle'}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  assistantState === 'idle'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play className="h-5 w-5" />
                Start Voice Assistant
              </button>
              
              <button
                type="button"
                onClick={stopVoiceRecognition}
                disabled={assistantState === 'idle'}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  assistantState !== 'idle'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <StopCircle className="h-5 w-5" />
                Stop Assistant
              </button>
            </>
          ) : (
            <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          )}
        </div>

        {/* Conversation Display */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Conversation</h4>
            <span className="ml-auto text-sm text-gray-500">
              Question {currentStep + 1} of {questionSteps.length}
            </span>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto p-2">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.speaker === 'assistant'
                      ? 'bg-white border border-gray-200 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${msg.speaker === 'assistant' ? 'text-gray-500' : 'text-blue-100'}`}>
                      {msg.speaker === 'assistant' ? 'Assistant' : 'You'}
                    </span>
                    <span className={`text-xs ${msg.speaker === 'assistant' ? 'text-gray-400' : 'text-blue-200'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {/* Current listening indicator */}
            {assistantState === 'listening' && userResponse && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl p-4 bg-blue-500 text-white rounded-tr-none">
                  <p className="text-sm italic">{userResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Question Display */}
        {assistantState !== 'idle' && currentStep < questionSteps.length && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  assistantState === 'asking' ? 'bg-blue-100 text-blue-600' :
                  assistantState === 'listening' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {assistantState === 'asking' ? (
                    <Volume2 className="h-5 w-5" />
                  ) : assistantState === 'listening' ? (
                    <Mic className="h-5 w-5 animate-pulse" />
                  ) : (
                    <span className="text-lg">⏳</span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Current Question</h4>
                <p className="text-gray-700">{questionSteps[currentStep]?.question}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Voice Commands */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Voice Commands</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Go back', 'Skip', 'Start over', 'Submit', 'Review', 'Stop', 'Help'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  processSpecialCommand(cmd.toLowerCase());
                  addToConversation('user', cmd);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Say "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="bg-white rounded-b-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Driver Information
              </h3>
            </div>

            {/* Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FloatingInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Full Name *"
                />
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (assistantState === 'idle') {
                        setCurrentStep(0);
                        askQuestion(0);
                      }
                    }}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Fill using voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FloatingInput
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  label="Phone *"
                />
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (assistantState === 'idle') {
                        setCurrentStep(1);
                        askQuestion(1);
                      }
                    }}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Fill using voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Salary per Duty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary per Duty
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="salary_per_duty"
                    value={formData.salary_per_duty || ""}
                    onChange={handleChange}
                    placeholder="Enter salary per duty"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (assistantState === 'idle') {
                        setCurrentStep(3);
                        askQuestion(3);
                      }
                    }}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Fill using voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Salary per Trip */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary per Trip
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    name="salary_per_trip"
                    value={formData.salary_per_trip || ""}
                    onChange={handleChange}
                    placeholder="Enter salary per trip"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (assistantState === 'idle') {
                        setCurrentStep(4);
                        askQuestion(4);
                      }
                    }}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Fill using voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Salary Validation Error */}
            {errors.salary && (
              <div className="md:col-span-2">
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {errors.salary}
                </p>
              </div>
            )}

            {/* Salary Summary */}
            {(formData.salary_per_duty > 0 || formData.salary_per_trip > 0) && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Salary Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {formData.salary_per_duty > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-blue-700">Per Duty:</span>
                        <span className="font-semibold text-blue-800">
                          {formatSalary(formData.salary_per_duty)}
                        </span>
                      </div>
                    )}
                    {formData.salary_per_trip > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-blue-700">Per Trip:</span>
                        <span className="font-semibold text-blue-800">
                          {formatSalary(formData.salary_per_trip)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter complete address"
                />
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (assistantState === 'idle') {
                        setCurrentStep(2);
                        askQuestion(2);
                      }
                    }}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors mt-1"
                    title="Fill using voice"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Driver" : "Create Driver"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/drivers")}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>

            {/* Voice Submit Button */}
            {isVoiceSupported && (
              <button
                type="button"
                onClick={() => {
                  addToConversation('user', 'Submit');
                  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) {
                    submitButton.click();
                  }
                }}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <Mic className="w-4 h-4 mr-2" />
                Submit via Voice
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageDriverForm;