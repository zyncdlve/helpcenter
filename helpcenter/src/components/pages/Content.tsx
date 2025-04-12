'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';

interface Step {
  text: string;
  img?: string;
}

interface ContentData {
  category: string;
  videoUrl: string;
  title: string;
  description: string;
  steps: Step[];
  thumbnail: string;
}

export default function Content() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title')?.trim() || '';

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const titleBgColor = '#000'; 
  const titleTextColor = '#fff'; 
  const videoBgColor = '#000'; 

  const [selectedContent, setSelectedContent] = useState<ContentData | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listId, setListId] = useState<string | null>(null);

  useEffect(() => {
    const storedListId = localStorage.getItem('selectedListId');
    if (storedListId) {
      setListId(storedListId);
    }
  }, []);

  useEffect(() => {
    const fetchInstructions = async () => {
      if (!listId) return;

      try {
        const instructionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructions/${listId}`);
        const instructions = await instructionsResponse.json();

        if (!instructions.length) {
          console.error('No instructions found');
          return;
        }

        const instructionData = instructions[0];

        setSelectedContent({
          category: instructionData.category_title,
          videoUrl: instructionData.instruction_video_url || '',
          title: instructionData.instruction_title,
          description: instructionData.instruction_description,
          steps: instructionData.steps.map((step: any, index: number) => ({
            text: step.steps_description,
            img: instructionData.pictures[index]?.picture_url || undefined,
          })),
          thumbnail: instructionData.instruction_thumbnail || instructionData.pictures[0]?.picture_url || '',
        });
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [listId]);

  const handlePlayClick = () => {
    setIsVideoPlaying(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading content...</div>;
  }

  if (!selectedContent) {
    return <div className="flex items-center justify-center h-screen text-xl">Content not found.</div>;
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-20 pt-22 mx-auto flex flex-col space-y-4 pb-16">
      <div className="flex flex-col items-stretch rounded-lg p-3" style={{ backgroundColor: '#000', color: '#000' }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold p-2" style={{ backgroundColor: titleBgColor, color: titleTextColor, borderRadius: '10px' }}>{selectedContent.title}</h1>

        <div className="relative w-full max-w-4xl mx-auto" style={{ backgroundColor: videoBgColor }}>
          {isVideoPlaying ? (
            <iframe
              className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] rounded-lg"
              src={selectedContent.videoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button onClick={handlePlayClick} className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
              <img
                src={selectedContent.thumbnail}
                alt={selectedContent.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex justify-center items-center">
                <div className={`relative flex items-center justify-center rounded-full w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
                  ${isDarkMode ? 'bg-white bg-opacity-30' : 'bg-black bg-opacity-60'}`}>
                  <span className={`${isDarkMode ? 'text-black' : 'text-white'} text-3xl`}>
                    ▶
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="p-2">
      <p className="text-sm italic opacity-50">
       The systems's theme color and logo may vary depending on the preferences and branding of each organization.
      </p>
      <h2 className="p-2 text-xl sm:text-2xl md:text-3xl">{selectedContent.description}</h2>
      </div>

      <div className="flex flex-col space-y-6">
        {selectedContent.steps.map((step, index) => (
          <div key={index} className="p-2 flex flex-col md:flex-row items-center gap-12">
            {step.img && (
              <img
                src={step.img}
                alt={step.text}
                className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto object-contain rounded-lg"
              />
            )}
            <p className="text-lg sm:text-xl md:text-2xl">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
