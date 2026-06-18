import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import documentService from "../../services/documentService.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";

import PageHeader from "../../components/common/PageHeader.jsx";
import Tabs from "../../components/common/Tabs.jsx";
import ChatInterface from "../../components/chat/ChatInterface.jsx";
import AIActions from "../../components/ai/AIActions.jsx";
import FlashcardManager from "../../components/flashcards/FlashcardManager.jsx";
import QuizManager from "../../components/quizzes/QuizManager.jsx";

const DEFAULT_TAB = "Content";
const TAB_QUERY_PARAM = "tab";
const TAB_NAMES = ["Content", "Chat", "AI Actions", "Flashcards", "Quizzes"];

const DocumentsDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestedTab = searchParams.get(TAB_QUERY_PARAM);
  const activeTab = TAB_NAMES.includes(requestedTab) ? requestedTab : DEFAULT_TAB;

  useEffect(() => {
    if (!requestedTab || TAB_NAMES.includes(requestedTab)) {
      return;
    }

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);
        nextSearchParams.delete(TAB_QUERY_PARAM);
        return nextSearchParams;
      },
      { replace: true }
    );
  }, [requestedTab, setSearchParams]);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocument();
  }, [id]);

  const renderContet = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (!document || !document?.filePath) {
      return <div className="text-center p-8">PDF not available.</div>;
    }

    const pdfUrl = document.filePath;

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm ">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">Document viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener norrefrrencer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            frameBorder="0"
            style={{ colorScheme: "light" }}
            className="w-full h-[70vh] rounded border border-gray-300"
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContet() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AI Actions", label: "AI Actions", content: renderAIActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  const setActiveTab = (tabName) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);

      if (tabName === DEFAULT_TAB) {
        nextSearchParams.delete(TAB_QUERY_PARAM);
      } else {
        nextSearchParams.set(TAB_QUERY_PARAM, tabName);
      }

      return nextSearchParams;
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to={"/documents"}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.title} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentsDetailPage;
