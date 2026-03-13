import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Plus, Minus, ArrowLeft, Image as ImageIcon, Type, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
}

export default function MomentEditor() {
  const navigate = useNavigate();
  const { addMoment, user } = useApp();
  const [shortDescription, setShortDescription] = useState('');
  const [impact, setImpact] = useState('0.01');
  const [isPositive, setIsPositive] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '' },
  ]);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const addContentBlock = (type: 'text' | 'image') => {
    if (type === 'image') {
      // For image, trigger file picker directly
      imageInputRef.current?.click();
    } else {
      // For text, create block immediately
      const newBlock: ContentBlock = {
        id: Date.now().toString(),
        type,
        content: '',
      };
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  const updateContentBlock = (id: string, content: string) => {
    setContentBlocks(
      contentBlocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const removeContentBlock = (id: string) => {
    // Allow removing any block, user can always add more
    setContentBlocks(contentBlocks.filter((block) => block.id !== id));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateContentBlock(id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle direct image upload from "Add Image" button
  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create new image block with content
        const newBlock: ContentBlock = {
          id: Date.now().toString(),
          type: 'image',
          content: reader.result as string,
        };
        setContentBlocks([...contentBlocks, newBlock]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleSave = () => {
    if (!shortDescription.trim()) {
      alert('Please enter a short description');
      return;
    }

    const impactDecimal = parseFloat(impact) / 100;

    // Filter and collect all valid content blocks
    const validContents = contentBlocks.filter((block) => {
      if (block.type === 'text') {
        return block.content.trim() !== '';
      } else {
        return block.content !== '';
      }
    }).map((block) => ({
      type: block.type,
      content: block.content,
    }));

    // Extract all images for thumbnails (not just first 3)
    const images = contentBlocks
      .filter((block) => block.type === 'image' && block.content)
      .map((block) => block.content);

    addMoment({
      date: new Date().toISOString(),
      shortDescription,
      impact: impactDecimal,
      isPositive,
      contents: validContents,
      images,
    });

    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl mb-8">New Moment</h1>

        {/* Short Description */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            Short Description
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="One sentence summary of this moment"
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Impact Percentage */}
        <div className="mb-8">
          <label className="block text-sm text-gray-600 mb-2">
            Impact on Life Progress
          </label>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setIsPositive(true)}
                className={`p-3 rounded-lg transition-colors ${
                  isPositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPositive(false)}
                className={`p-3 rounded-lg transition-colors ${
                  !isPositive
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-32 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-gray-600">%</span>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-4">Content</label>
          <div className="space-y-4">
            {contentBlocks.map((block) => (
              <div key={block.id} className="relative group">
                {block.type === 'text' ? (
                  <textarea
                    value={block.content}
                    onChange={(e) =>
                      updateContentBlock(block.id, e.target.value)
                    }
                    placeholder="Write your thoughts..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[120px] resize-y"
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {block.content ? (
                      <div className="relative">
                        <img
                          src={block.content}
                          alt=""
                          className="w-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Click to upload image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(block.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
                {/* Always show delete button, allow removing all blocks */}
                <button
                  onClick={() => removeContentBlock(block.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Content Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => addContentBlock('text')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Type className="w-4 h-4" />
            Add Text
          </button>
          <button
            onClick={() => addContentBlock('image')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Add Image
          </button>
          {/* Hidden file input for direct image upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectImageUpload}
            className="hidden"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full md:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Save Moment
        </button>
      </div>
    </div>
  );
}
