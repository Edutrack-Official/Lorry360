import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { X, Plus, AlertCircle, FileText, Hash, Type, List, BookOpen, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../../api/client";

// --- Types ---
interface ValidationErrors {
    questionText?: string;
    options?: string[];
    numericalValue?: string;
    passage?: string;
    explanation?: string;
    tags?: string;
    difficulty?: string;
    general?: string;
    childQuestions?: string[];
}

interface DifficultyOption {
    value: string;
    label: string;
}

interface QuestionTypeOption {
    value: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

interface ChildQuestion {
    id: string;
    text: string;
    questionType: string;
    answers: {
        options?: string[];
        correctIndex?: number;
        correctIndices?: number[];
        numericalValue?: number;
    };
    explanation?: string;
    difficulty: string;
    tags: string[];
    isEditing?: boolean;
    _id?: string;
    operation?: 'CREATE' | 'UPDATE' | 'DELETE' | 'NO_CHANGE';
}

// --- Component ---
const ManageQuestionForm: React.FC = () => {
    const navigate = useNavigate();
    const { questionSetId, id } = useParams<{ questionSetId?: string; id?: string }>();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const quillRef = useRef<ReactQuill>(null);

    // --- State for all question types ---
    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("SINGLE_CORRECT");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
    const [correctAnswerIndices, setCorrectAnswerIndices] = useState<number[]>([]);
    const [numericalValue, setNumericalValue] = useState("");
    const [passage, setPassage] = useState("");
    const [explanation, setExplanation] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isActive, setIsActive] = useState(true);
    
    // --- Child Questions State ---
    const [childQuestions, setChildQuestions] = useState<ChildQuestion[]>([]);
    const [showChildForm, setShowChildForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [childToDelete, setChildToDelete] = useState<string | null>(null);
    const [currentChild, setCurrentChild] = useState<ChildQuestion>({
        id: '',
        text: '',
        questionType: 'SINGLE_CORRECT',
        answers: { options: ["", "", "", ""], correctIndex: 0 },
        explanation: '',
        difficulty: 'Medium',
        tags: [],
        isEditing: false,
        operation: 'CREATE'
    });

    // --- Child Form State ---
    const [childTagInput, setChildTagInput] = useState("");
    const [childOptions, setChildOptions] = useState<string[]>(["", "", "", ""]);
    const [childCorrectAnswerIndex, setChildCorrectAnswerIndex] = useState(0);
    const [childCorrectAnswerIndices, setChildCorrectAnswerIndices] = useState<number[]>([]);
    const [childNumericalValue, setChildNumericalValue] = useState("");

    // --- React Quill Image Handling ---
    const [quillImageMap, setQuillImageMap] = useState<Map<string, File>>(new Map());

    const difficultyOptions: DifficultyOption[] = [
        { value: "Easy", label: "Easy" },
        { value: "Medium", label: "Medium" },
        { value: "Hard", label: "Hard" },
    ];

    const questionTypeOptions: QuestionTypeOption[] = [
        { 
            value: "SINGLE_CORRECT", 
            label: "Single Correct MCQ", 
            description: "One correct answer from multiple options",
            icon: <FileText size={16} />
        },
        { 
            value: "MULTIPLE_CORRECT", 
            label: "Multiple Correct MCQ", 
            description: "Multiple correct answers from options",
            icon: <List size={16} />
        },
        { 
            value: "NUMERICAL", 
            label: "Numerical Answer", 
            description: "Decimal or fractional answer",
            icon: <Hash size={16} />
        },
        { 
            value: "INTEGER", 
            label: "Integer Answer", 
            description: "Whole number answer",
            icon: <Type size={16} />
        },
        { 
            value: "COMPREHENSION", 
            label: "Comprehension", 
            description: "Passage with multiple sub-questions",
            icon: <BookOpen size={16} />
        },
    ];

    const [difficulty, setDifficulty] = useState<DifficultyOption | null>(difficultyOptions[1]);

    // --- Helper function to convert base64 to File ---
    const base64ToFile = (base64: string, filename: string = 'pasted-image.png'): File => {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // --- Custom Image Upload Handler ---
    function handleImageUpload() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setQuillImageMap(prev => new Map(prev.set(base64, file)));

                const quill = quillRef.current?.getEditor();
                if (!quill) return;

                const range = quill.getSelection(true);
                const index = range ? range.index : quill.getLength();
                quill.insertEmbed(index, 'image', base64);
            };
            reader.readAsDataURL(file);
        };
    }

    // --- Handle paste events for images ---
    const handleQuillChange = (content: string, delta: any, source: any, editor: any) => {
        setQuestionText(content);

        const base64Images = content.match(/data:image\/[^;]+;base64,[^"'\s>]+/g) || [];
        base64Images.forEach((base64: string) => {
            if (!quillImageMap.has(base64)) {
                try {
                    const file = base64ToFile(base64, `pasted-image-${Date.now()}.png`);
                    if (file.size > 5 * 1024 * 1024) {
                        toast.error('Pasted image size must be less than 5MB');
                        const quill = quillRef.current?.getEditor();
                        if (quill) {
                            const newContent = content.replace(base64, '');
                            quill.root.innerHTML = newContent;
                        }
                        return;
                    }
                    setQuillImageMap(prev => new Map(prev.set(base64, file)));
                } catch (error) {
                    console.error('Error processing pasted image:', error);
                    toast.error('Error processing pasted image');
                }
            }
        });

        setQuillImageMap(prev => {
            const newMap = new Map();
            prev.forEach((file, base64) => {
                if (content.includes(base64)) {
                    newMap.set(base64, file);
                }
            });
            return newMap;
        });
    };

    // --- React Quill Configuration ---
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: handleImageUpload
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'list', 'bullet', 'indent',
        'align', 'link', 'image'
    ];

    // --- Validation Functions ---
    const validateQuestion = (text: string): string | undefined => {
        const strippedText = text.replace(/<[^>]*>/g, '').trim();
        if (!strippedText) return "Question text is required";
        if (strippedText.length < 10) return "Question must be at least 10 characters long";
        if (strippedText.length > 1000) return "Question must not exceed 1000 characters";
        return undefined;
    };

    const validateOptions = (opts: string[]): string[] | undefined => {
        const errors: string[] = [];
        const nonEmptyOptions = opts.filter(opt => opt.trim());

        if (nonEmptyOptions.length < 2) {
            return ["At least 2 options are required"];
        }

        opts.forEach((opt, index) => {
            if (!opt.trim()) {
                errors[index] = "Option cannot be empty";
            } else if (opt.trim().length > 200) {
                errors[index] = "Option must not exceed 200 characters";
            }
        });

        const trimmedOptions = opts.map(opt => opt.trim().toLowerCase());
        const duplicates = trimmedOptions.filter((opt, index) => opt && trimmedOptions.indexOf(opt) !== index);
        if (duplicates.length > 0) {
            opts.forEach((opt, index) => {
                if (duplicates.includes(opt.trim().toLowerCase())) {
                    errors[index] = "Duplicate option found";
                }
            });
        }

        return errors.length > 0 ? errors : undefined;
    };

    const validateNumerical = (value: string): string | undefined => {
        if (!value.trim()) return "Numerical value is required";
        if (isNaN(Number(value))) return "Must be a valid number";
        return undefined;
    };

    const validatePassage = (text: string): string | undefined => {
        if (!text.trim()) return "Passage is required for comprehension";
        if (text.trim().length < 50) return "Passage must be at least 50 characters long";
        if (text.trim().length > 5000) return "Passage must not exceed 5000 characters";
        return undefined;
    };

    const validateMultipleCorrect = (indices: number[], options: string[]): string | undefined => {
        if (indices.length === 0) return "At least one correct answer must be selected";
        if (indices.length > options.filter(opt => opt.trim()).length) return "Invalid selection";
        return undefined;
    };

    const validateForm = (): ValidationErrors => {
        const newErrors: ValidationErrors = {};

        // Common validations
        const questionError = validateQuestion(questionText);
        if (questionError) newErrors.questionText = questionError;

        const explanationError = validateExplanation(explanation);
        if (explanationError) newErrors.explanation = explanationError;

        const tagError = validateTags(tags);
        if (tagError) newErrors.tags = tagError;

        const difficultyError = validateDifficulty(difficulty);
        if (difficultyError) newErrors.difficulty = difficultyError;

        // Type-specific validations
        if (questionType === 'SINGLE_CORRECT') {
            const optionErrors = validateOptions(options);
            if (optionErrors) newErrors.options = optionErrors;
            
            const nonEmptyOptions = options.filter(opt => opt.trim());
            if (correctAnswerIndex >= nonEmptyOptions.length) {
                newErrors.general = "Please select a valid correct answer";
            }
        } 
        else if (questionType === 'MULTIPLE_CORRECT') {
            const optionErrors = validateOptions(options);
            if (optionErrors) newErrors.options = optionErrors;
            
            const multipleError = validateMultipleCorrect(correctAnswerIndices, options);
            if (multipleError) newErrors.general = multipleError;
        }
        else if (questionType === 'NUMERICAL' || questionType === 'INTEGER') {
            const numericalError = validateNumerical(numericalValue);
            if (numericalError) newErrors.numericalValue = numericalError;
        }
        else if (questionType === 'COMPREHENSION') {
            const passageError = validatePassage(passage);
            if (passageError) newErrors.passage = passageError;
        }

        return newErrors;
    };

    const validateExplanation = (text: string): string | undefined => {
        if (text && text.length > 2000) return "Explanation must not exceed 2000 characters";
        return undefined;
    };

    const validateTags = (tagList: string[]): string | undefined => {
        if (tagList.length > 10) return "Maximum 10 tags allowed";
        const invalidTags = tagList.filter(tag => tag.length > 30);
        if (invalidTags.length > 0) return "Each tag must not exceed 30 characters";
        return undefined;
    };

    const validateDifficulty = (diff: any): string | undefined => {
        if (!diff) return "Difficulty level is required";
        return undefined;
    };

    // --- Process Quill Content for Backend ---
    const processQuillContentForSubmit = (content: string) => {
        let processedContent = content;
        const quillImages: File[] = [];

        quillImageMap.forEach((file, base64) => {
            if (content.includes(base64)) {
                const dummyUrl = `temp-image-${quillImages.length}`;
                const escapedBase64 = base64.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                processedContent = processedContent.replace(
                    new RegExp(escapedBase64, 'g'),
                    dummyUrl
                );
                quillImages.push(file);
            }
        });

        return {
            content: processedContent,
            images: quillImages
        };
    };

    // --- Fetch Question if Editing ---
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api
            .get(`/question/${id}`)
            .then((res) => {
                const q = res.data;
                setQuestionText(q.text || "");
                setQuestionType(q.questionType || "SINGLE_CORRECT");
                setOptions(q.answers?.options || ["", "", "", ""]);
                setCorrectAnswerIndex(q.answers?.correctIndex ?? 0);
                setCorrectAnswerIndices(q.answers?.correctIndices || []);
                setNumericalValue(q.answers?.numericalValue?.toString() || "");
                setPassage(q.answers?.passage || "");
                setExplanation(q.explanation || "");
                setTags(q.tags || []);
                setDifficulty(difficultyOptions.find((d) => d.value === q.difficulty) || difficultyOptions[1]);
                setIsActive(q.isActive ?? true);

                // If editing comprehension, populate child questions
                if (q.questionType === 'COMPREHENSION' && q.childQuestions) {
                    const formattedChildren = q.childQuestions.map((child: any, index: number) => ({
                        id: child._id || `child-${index}`,
                        _id: child._id,
                        text: child.text,
                        questionType: child.questionType,
                        answers: {
                            options: child.answers?.options || [],
                            correctIndex: child.answers?.correctIndex,
                            correctIndices: child.answers?.correctIndices || [],
                            numericalValue: child.answers?.numericalValue
                        },
                        explanation: child.explanation || '',
                        difficulty: child.difficulty || 'Medium',
                        tags: child.tags || [],
                        operation: 'NO_CHANGE'
                    }));
                    setChildQuestions(formattedChildren);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch question", err);
                toast.error("Failed to load question data");
            })
            .finally(() => setLoading(false));
    }, [id]);

    // --- Clear errors when fields change ---
    useEffect(() => {
        if (errors.questionText && questionText.trim()) {
            setErrors(prev => ({ ...prev, questionText: undefined }));
        }
    }, [questionText, errors.questionText]);

    useEffect(() => {
        if (errors.passage && passage.trim()) {
            setErrors(prev => ({ ...prev, passage: undefined }));
        }
    }, [passage, errors.passage]);

    // --- Option Management ---
    const handleOptionChange = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, ""]);
        } else {
            toast.error("Maximum 6 options allowed");
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
            
            if (questionType === 'MULTIPLE_CORRECT') {
                const updatedIndices = correctAnswerIndices
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                setCorrectAnswerIndices(updatedIndices);
            } else {
                if (correctAnswerIndex === index) {
                    setCorrectAnswerIndex(0);
                } else if (correctAnswerIndex > index) {
                    setCorrectAnswerIndex(correctAnswerIndex - 1);
                }
            }
        } else {
            toast.error("Minimum 2 options required");
        }
    };

    // --- Multiple Correct Selection ---
    const toggleMultipleCorrect = (index: number) => {
        setCorrectAnswerIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    // --- Tags Management ---
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (tags.length >= 10) {
                toast.error("Maximum 10 tags allowed");
                return;
            }
            if (newTag.length > 30) {
                toast.error("Tag must not exceed 30 characters");
                return;
            }
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput("");
            } else {
                toast.error("Tag already exists");
            }
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // --- Child Question Management ---
    const addChildQuestion = () => {
        if (!currentChild.text.trim()) {
            toast.error("Child question text is required");
            return;
        }

        const childErrors = validateChildQuestion(currentChild);
        if (Object.keys(childErrors).length > 0) {
            toast.error("Please fix child question errors");
            return;
        }

        // Prepare child data with current form state
        const childData: ChildQuestion = {
            ...currentChild,
            answers: {
                ...currentChild.answers,
                options: childOptions.filter(opt => opt.trim()),
                correctIndex: childCorrectAnswerIndex,
                correctIndices: childCorrectAnswerIndices,
                numericalValue: childNumericalValue ? parseFloat(childNumericalValue) : undefined
            },
            tags: currentChild.tags || []
        };

        if (currentChild.isEditing) {
            setChildQuestions(prev => 
                prev.map(child => 
                    child.id === currentChild.id 
                        ? { ...childData, isEditing: false, operation: 'UPDATE' as const }
                        : child
                )
            );
            toast.success("Child question updated!");
        } else {
            const newChild = {
                ...childData,
                id: Date.now().toString(),
                operation: 'CREATE' as const
            };
            setChildQuestions(prev => [...prev, newChild]);
            toast.success("Child question added!");
        }

        resetChildForm();
        setShowChildForm(false);
    };

    const editChildQuestion = (child: ChildQuestion) => {
        setCurrentChild({ ...child, isEditing: true });
        setChildOptions(child.answers.options || ["", "", "", ""]);
        setChildCorrectAnswerIndex(child.answers.correctIndex || 0);
        setChildCorrectAnswerIndices(child.answers.correctIndices || []);
        setChildNumericalValue(child.answers.numericalValue?.toString() || "");
        setShowChildForm(true);
    };

    const confirmDeleteChild = (id: string) => {
        setChildToDelete(id);
        setShowDeleteConfirm(true);
    };

    const deleteChildQuestion = () => {
        if (childToDelete) {
            setChildQuestions(prev => 
                prev.map(child => 
                    child.id === childToDelete 
                        ? { ...child, operation: 'DELETE' as const }
                        : child
                )
            );
            toast.success("Child question marked for deletion!");
        }
        setShowDeleteConfirm(false);
        setChildToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setChildToDelete(null);
    };

    const resetChildForm = () => {
        setCurrentChild({
            id: '',
            text: '',
            questionType: 'SINGLE_CORRECT',
            answers: { options: ["", "", "", ""], correctIndex: 0 },
            explanation: '',
            difficulty: 'Medium',
            tags: [],
            isEditing: false,
            operation: 'CREATE'
        });
        setChildOptions(["", "", "", ""]);
        setChildCorrectAnswerIndex(0);
        setChildCorrectAnswerIndices([]);
        setChildNumericalValue("");
        setChildTagInput("");
    };

    const cancelChildForm = () => {
        resetChildForm();
        setShowChildForm(false);
    };

    // --- Child Option Management ---
    const handleChildOptionChange = (index: number, value: string) => {
        const updated = [...childOptions];
        updated[index] = value;
        setChildOptions(updated);
    };

    const addChildOption = () => {
        if (childOptions.length < 6) {
            setChildOptions([...childOptions, ""]);
        } else {
            toast.error("Maximum 6 options allowed");
        }
    };

    const removeChildOption = (index: number) => {
        if (childOptions.length > 2) {
            const newOptions = childOptions.filter((_, i) => i !== index);
            setChildOptions(newOptions);
            
            if (currentChild.questionType === 'MULTIPLE_CORRECT') {
                const updatedIndices = childCorrectAnswerIndices
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                setChildCorrectAnswerIndices(updatedIndices);
            } else {
                if (childCorrectAnswerIndex === index) {
                    setChildCorrectAnswerIndex(0);
                } else if (childCorrectAnswerIndex > index) {
                    setChildCorrectAnswerIndex(childCorrectAnswerIndex - 1);
                }
            }
        } else {
            toast.error("Minimum 2 options required");
        }
    };

    const toggleChildMultipleCorrect = (index: number) => {
        setChildCorrectAnswerIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    // --- Child Tags Management ---
    const handleChildTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && childTagInput.trim() !== "") {
            e.preventDefault();
            const newTag = childTagInput.trim();
            if (currentChild.tags.length >= 10) {
                toast.error("Maximum 10 tags allowed");
                return;
            }
            if (newTag.length > 30) {
                toast.error("Tag must not exceed 30 characters");
                return;
            }
            if (!currentChild.tags.includes(newTag)) {
                setCurrentChild(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
                setChildTagInput("");
            } else {
                toast.error("Tag already exists");
            }
        }
    };

    const removeChildTag = (index: number) => {
        setCurrentChild(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    // --- Child Question Validation ---
    const validateChildQuestion = (child: ChildQuestion): any => {
        const errors: any = {};

        if (!child.text.trim()) {
            errors.text = "Question text is required";
        }

        if (child.questionType === 'SINGLE_CORRECT' || child.questionType === 'MULTIPLE_CORRECT') {
            const nonEmptyOptions = childOptions.filter(opt => opt.trim());
            if (nonEmptyOptions.length < 2) {
                errors.options = "At least 2 options are required";
            }
            
            if (child.questionType === 'SINGLE_CORRECT') {
                if (childCorrectAnswerIndex >= nonEmptyOptions.length) {
                    errors.correctAnswer = "Please select a valid correct answer";
                }
            } else {
                if (childCorrectAnswerIndices.length === 0) {
                    errors.correctAnswer = "At least one correct answer must be selected";
                }
            }
        } else if (child.questionType === 'NUMERICAL' || child.questionType === 'INTEGER') {
            if (!childNumericalValue.trim()) {
                errors.numericalValue = "Numerical value is required";
            }
            if (isNaN(Number(childNumericalValue))) {
                errors.numericalValue = "Must be a valid number";
            }
        }

        return errors;
    };

    // --- Update Child Question Fields ---
    const updateChildField = (field: string, value: any) => {
        setCurrentChild(prev => ({ ...prev, [field]: value }));
    };

    // --- Submit Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            toast.error("Please fix the validation errors");
            return;
        }

        if (questionType === 'COMPREHENSION' && childQuestions.length === 0) {
            toast.error("Comprehension must have at least one child question");
            return;
        }

        setSubmitting(true);
        setErrors({});

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const { content: processedContent, images: quillImages } = processQuillContentForSubmit(questionText);

            const formData = new FormData();
            
            // Common fields
            formData.append("text", processedContent);
            formData.append("questionType", questionType);
            formData.append("explanation", explanation.trim());
            formData.append("tags", JSON.stringify(tags));
            formData.append("difficulty", difficulty?.value || "Medium");
            formData.append("isActive", String(isActive));
            formData.append("questionSetId", questionSetId || "");
            formData.append("createdBy", user?.id);
            formData.append("lastUpdatedBy", user?.id);

            // Type-specific answers
            const answers: any = {};
            
            if (questionType === 'SINGLE_CORRECT') {
                answers.options = options.filter(opt => opt.trim());
                answers.correctIndex = correctAnswerIndex;
            }
            else if (questionType === 'MULTIPLE_CORRECT') {
                answers.options = options.filter(opt => opt.trim());
                answers.correctIndices = correctAnswerIndices;
            }
            else if (questionType === 'NUMERICAL' || questionType === 'INTEGER') {
                answers.numericalValue = parseFloat(numericalValue);
            }
            else if (questionType === 'COMPREHENSION') {
                answers.passage = passage;
                answers.isComprehensionParent = true;
            }

            formData.append("answers", JSON.stringify(answers));

            // Add Quill embedded images
            quillImages.forEach((file) => {
                formData.append("quillImages", file);
            });

            let result;
            if (id) {
                if (questionType === 'COMPREHENSION') {
                    const childrenToSend = childQuestions.filter(child => 
                        !(child.operation === 'DELETE' && !child._id)
                    );
                    formData.append("childQuestions", JSON.stringify(childrenToSend));
                }

                result = await api.put(`/question/update/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Question updated successfully!");
            } else {
                result = await api.post(`/question/create`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Question created successfully!");

                if (questionType === 'COMPREHENSION' && childQuestions.length > 0) {
                    const parentId = result.data._id || result.data.questionId;
                    await createChildQuestions(parentId);
                }
            }

            navigate(`/questions/${questionSetId}`);
        } catch (err: any) {
            console.error("Submit failed", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Operation failed. Please try again.";
            toast.error(errorMessage);
            setErrors({ general: errorMessage });
        } finally {
            setSubmitting(false);
        }
    };

    const createChildQuestions = async (parentId: string) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            
            const childrenToCreate = childQuestions.filter(child => child.operation === 'CREATE');
            
            for (const child of childrenToCreate) {
                const childFormData = new FormData();
                childFormData.append("text", child.text);
                childFormData.append("questionType", child.questionType);
                childFormData.append("explanation", child.explanation || "");
                childFormData.append("difficulty", child.difficulty);
                childFormData.append("tags", JSON.stringify(child.tags));
                childFormData.append("isActive", "true");
                childFormData.append("questionSetId", questionSetId || "");
                childFormData.append("createdBy", user?.id);
                childFormData.append("lastUpdatedBy", user?.id);

                const childAnswers = {
                    ...child.answers,
                    comprehensionParentId: parentId
                };
                childFormData.append("answers", JSON.stringify(childAnswers));

                await api.post(`/question/create`, childFormData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            
            toast.success(`${childrenToCreate.length} child questions created successfully!`);
        } catch (err) {
            console.error("Failed to create child questions", err);
            toast.error("Parent comprehension created, but failed to create some child questions");
        }
    };

    // --- Render different input fields based on question type ---
    const renderAnswerInputs = () => {
        switch (questionType) {
            case 'SINGLE_CORRECT':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Answer Options <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {options.map((opt, index) => (
                                <div key={index} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${correctAnswerIndex === index ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                                    <input type="radio" name="correctAnswer" checked={correctAnswerIndex === index} onChange={() => setCorrectAnswerIndex(index)} className="h-5 w-5 text-green-600" />
                                    <textarea value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.options?.[index] ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} maxLength={200} />
                                    {options.length > 2 && (<button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg"><X size={18} /></button>)}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addOption} disabled={options.length >= 6} className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg disabled:opacity-50"><Plus size={18} className="mr-2" />Add Option</button>
                    </div>
                );

            case 'MULTIPLE_CORRECT':
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Answer Options <span className="text-red-500">*</span> (Select multiple correct answers)
                        </label>
                        <div className="space-y-3">
                            {options.map((opt, index) => (
                                <div key={index} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${correctAnswerIndices.includes(index) ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                                    <input type="checkbox" checked={correctAnswerIndices.includes(index)} onChange={() => toggleMultipleCorrect(index)} className="h-5 w-5 text-green-600 rounded" />
                                    <textarea value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.options?.[index] ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} maxLength={200} />
                                    {options.length > 2 && (<button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg"><X size={18} /></button>)}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addOption} disabled={options.length >= 6} className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg disabled:opacity-50"><Plus size={18} className="mr-2" />Add Option</button>
                        {correctAnswerIndices.length > 0 && (<div className="text-sm text-green-600">Selected {correctAnswerIndices.length} correct answer(s)</div>)}
                    </div>
                );

            case 'NUMERICAL':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Numerical Answer <span className="text-red-500">*</span>
                        </label>
                        <input type="number" step="any" value={numericalValue} onChange={(e) => setNumericalValue(e.target.value)} placeholder="Enter numerical value (e.g., 42.5)" className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.numericalValue ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} />
                        {errors.numericalValue && (<div className="flex items-center text-red-500 text-sm"><AlertCircle size={14} className="mr-1" />{errors.numericalValue}</div>)}
                    </div>
                );

            case 'INTEGER':
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Integer Answer <span className="text-red-500">*</span>
                        </label>
                        <input type="number" step="1" value={numericalValue} onChange={(e) => setNumericalValue(e.target.value)} placeholder="Enter whole number (e.g., 42)" className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${errors.numericalValue ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} />
                        {errors.numericalValue && (<div className="flex items-center text-red-500 text-sm"><AlertCircle size={14} className="mr-1" />{errors.numericalValue}</div>)}
                    </div>
                );

            case 'COMPREHENSION':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Comprehension Passage <span className="text-red-500">*</span>
                            </label>
                            <textarea value={passage} onChange={(e) => setPassage(e.target.value)} rows={8} placeholder="Enter the comprehension passage text..." className={`w-full border rounded-lg p-4 focus:outline-none focus:ring-2 ${errors.passage ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} maxLength={5000} />
                            {errors.passage && (<div className="flex items-center text-red-500 text-sm"><AlertCircle size={14} className="mr-1" />{errors.passage}</div>)}
                            <div className="text-sm text-gray-500">Characters: {passage.length}/5000</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center text-blue-800 mb-2"><BookOpen size={16} className="mr-2" /><span className="font-medium">Comprehension Note</span></div>
                            <p className="text-blue-700 text-sm">After creating this comprehension passage, you can add child questions that reference this passage.</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // --- Render Child Question Form ---
    const renderChildQuestionForm = () => {
        if (!showChildForm) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="border-2 border-blue-200 rounded-lg p-6 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-blue-800">
                                {currentChild.isEditing ? "Edit Child Question" : "Add Child Question"}
                            </h3>
                            <button
                                type="button"
                                onClick={cancelChildForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Child Question Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Text <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={currentChild.text}
                                    onChange={(e) => updateChildField('text', e.target.value)}
                                    rows={3}
                                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter child question text..."
                                />
                            </div>

                            {/* Child Question Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Type
                                </label>
                                <Select
                                    value={questionTypeOptions.find(opt => opt.value === currentChild.questionType)}
                                    onChange={(selected) => updateChildField('questionType', selected?.value || 'SINGLE_CORRECT')}
                                    options={questionTypeOptions.filter(opt => opt.value !== 'COMPREHENSION')}
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>

                            {/* Child Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty
                                </label>
                                <Select
                                    value={difficultyOptions.find(opt => opt.value === currentChild.difficulty)}
                                    onChange={(selected) => updateChildField('difficulty', selected?.value || 'Medium')}
                                    options={difficultyOptions}
                                />
                            </div>

                            {/* Child Answer Inputs */}
                            {(currentChild.questionType === 'SINGLE_CORRECT' || currentChild.questionType === 'MULTIPLE_CORRECT') && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Options <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {childOptions.map((opt, index) => (
                                            <div key={index} className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                                                (currentChild.questionType === 'SINGLE_CORRECT' && childCorrectAnswerIndex === index) ||
                                                (currentChild.questionType === 'MULTIPLE_CORRECT' && childCorrectAnswerIndices.includes(index))
                                                    ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                            }`}>
                                                {currentChild.questionType === 'SINGLE_CORRECT' ? (
                                                    <input
                                                        type="radio"
                                                        checked={childCorrectAnswerIndex === index}
                                                        onChange={() => setChildCorrectAnswerIndex(index)}
                                                        className="h-5 w-5 text-green-600"
                                                    />
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={childCorrectAnswerIndices.includes(index)}
                                                        onChange={() => toggleChildMultipleCorrect(index)}
                                                        className="h-5 w-5 text-green-600 rounded"
                                                    />
                                                )}
                                                <textarea
                                                    value={opt}
                                                    onChange={(e) => handleChildOptionChange(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    maxLength={200}
                                                />
                                                {childOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChildOption(index)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChildOption}
                                        disabled={childOptions.length >= 6}
                                        className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                                    >
                                        <Plus size={18} className="mr-2" />Add Option
                                    </button>
                                </div>
                            )}

                            {(currentChild.questionType === 'NUMERICAL' || currentChild.questionType === 'INTEGER') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Answer <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step={currentChild.questionType === 'INTEGER' ? "1" : "any"}
                                        value={childNumericalValue}
                                        onChange={(e) => setChildNumericalValue(e.target.value)}
                                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={currentChild.questionType === 'INTEGER' ? "Enter whole number" : "Enter numerical value"}
                                    />
                                </div>
                            )}

                            {/* Child Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2 border rounded-lg p-3">
                                    {currentChild.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeChildTag(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={childTagInput}
                                        onChange={(e) => setChildTagInput(e.target.value)}
                                        onKeyDown={handleChildTagKeyDown}
                                        placeholder="Add tags"
                                        className="flex-1 border-none focus:ring-0 bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Child Explanation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Explanation (Optional)
                                </label>
                                <textarea
                                    value={currentChild.explanation || ''}
                                    onChange={(e) => updateChildField('explanation', e.target.value)}
                                    rows={3}
                                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional explanation for this question"
                                />
                            </div>

                            {/* Child Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={addChildQuestion}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                                >
                                    {currentChild.isEditing ? "Update Question" : "Add Question"}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelChildForm}
                                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Delete Confirmation Popup ---
    const renderDeleteConfirmation = () => {
        if (!showDeleteConfirm) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md">
                    <div className="border-2 border-red-200 rounded-lg p-6 bg-white">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                            <h3 className="text-lg font-semibold text-red-800">Delete Child Question</h3>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this child question? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={deleteChildQuestion}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Render Child Questions List ---
    const renderChildQuestionsList = () => {
        if (questionType !== 'COMPREHENSION' || childQuestions.length === 0) return null;

        const childrenToDisplay = childQuestions.filter(child => child.operation !== 'DELETE');

        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Child Questions ({childrenToDisplay.length})
                </h3>
                <div className="space-y-3">
                    {childrenToDisplay.map((child, index) => (
                        <div key={child.id} className={`border rounded-lg p-4 shadow-sm ${
                            child.operation === 'CREATE' ? 'bg-green-50 border-green-200' : 
                            child.operation === 'UPDATE' ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-white border-gray-200'
                        }`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {child.questionType}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                            {child.difficulty}
                                        </span>
                                        {child.operation === 'CREATE' && (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                New
                                            </span>
                                        )}
                                        {child.operation === 'UPDATE' && (
                                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                Modified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-800 mb-2">{child.text}</p>
                                    {child.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {child.tags.map((tag, tagIndex) => (
                                                <span key={tagIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {child.explanation && (
                                        <p className="text-sm text-gray-600">Explanation: {child.explanation}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => editChildQuestion(child)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDeleteChild(child.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading question data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="px-6 py-8 sm:px-8">
                        {errors.general && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                                <span className="text-red-700">{errors.general}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Question Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Question Type <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={questionTypeOptions.find(opt => opt.value === questionType)}
                                    onChange={(selected) => setQuestionType(selected?.value || "SINGLE_CORRECT")}
                                    options={questionTypeOptions}
                                    formatOptionLabel={({ label, description, icon }) => (
                                        <div className="flex items-center space-x-3">
                                            <div className="text-gray-600">{icon}</div>
                                            <div>
                                                <div className="font-medium">{label}</div>
                                                <div className="text-xs text-gray-500">{description}</div>
                                            </div>
                                        </div>
                                    )}
                                    placeholder="Select question type"
                                />
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Difficulty Level <span className="text-red-500">*</span>
                                </label>
                                <Select value={difficulty} onChange={(selected) => setDifficulty(selected)} options={difficultyOptions} placeholder="Select difficulty level" />
                            </div>

                            {/* Question Text */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {questionType === 'COMPREHENSION' ? "Question Title" : "Question Text"} <span className="text-red-500">*</span>
                                </label>
                                <div className={`border rounded-lg ${errors.questionText ? "border-red-300" : "border-gray-300"}`}>
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={questionText}
                                        onChange={handleQuillChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder={questionType === 'COMPREHENSION' ? "Enter comprehension title (e.g., 'Read the following passage and answer questions:')" : "Enter your question text here..."}
                                        style={{ minHeight: '200px' }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    {errors.questionText && (<div className="flex items-center text-red-500 text-sm"><AlertCircle size={14} className="mr-1" />{errors.questionText}</div>)}
                                    <span className="text-sm text-gray-400">Characters: {questionText.replace(/<[^>]*>/g, '').length}/1000</span>
                                </div>
                                <div className="text-xs text-gray-500">💡 Tip: Click the image icon or paste screenshots directly into the editor.</div>
                            </div>

                            {/* Answer Inputs (Type-specific) */}
                            {renderAnswerInputs()}

                            {/* Comprehension Child Questions Section */}
                            {questionType === 'COMPREHENSION' && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Child Questions
                                        </h3>
                                        {!showChildForm && (
                                            <button
                                                type="button"
                                                onClick={() => setShowChildForm(true)}
                                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                <Plus size={18} className="mr-2" />
                                                Add Child Question
                                            </button>
                                        )}
                                    </div>

                                    {renderChildQuestionsList()}
                                    {renderChildQuestionForm()}

                                    {childQuestions.length === 0 && !showChildForm && (
                                        <div className="text-center py-8 text-gray-500">
                                            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No child questions added yet.</p>
                                            <p className="text-sm">Click "Add Child Question" to start adding questions based on the passage.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Explanation */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
                                <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={6} className="w-full border rounded-lg p-4" maxLength={2000} placeholder="Provide explanation (optional)" />
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Tags (Optional)</label>
                                <div className="flex flex-wrap gap-2 border rounded-lg p-3">
                                    {tags.map((tag, index) => (<span key={index} className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{tag}<button type="button" onClick={() => removeTag(index)} className="ml-2 text-blue-600 hover:text-blue-800"><X size={14} /></button></span>))}
                                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add tags" className="flex-1 border-none focus:ring-0 bg-transparent" />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? (id ? "Updating..." : "Creating...") : id ? "Update Question" : "Create Question"}
                                </button>
                                <button type="button" onClick={() => navigate(`/questions/${questionSetId}`)} disabled={submitting} className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 disabled:opacity-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {renderChildQuestionForm()}
            {renderDeleteConfirmation()}
        </div>
    );
};

export default ManageQuestionForm;