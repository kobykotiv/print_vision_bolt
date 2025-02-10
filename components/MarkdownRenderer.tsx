'use client';

    import React, { useEffect, useState } from 'react';
    import ReactMarkdown from 'react-markdown';
    import remarkGfm from 'remark-gfm';
    import rehypeRaw from 'rehype-raw';

    const MarkdownRenderer = ({ filename }: { filename: string }) => {
      const [content, setContent] = useState('');

      useEffect(() => {
        const filePath = `/data/${filename}`; // Path to content directory (assuming 'data' is in 'public')
        fetch(filePath)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch markdown file: ${res.status} ${res.statusText}`);
            }
            return res.text();
          })
          .then(data => setContent(data))
          .catch(err => console.error("Error reading markdown file:", err));
      }, [filename]);

      return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>;
    };

    export default MarkdownRenderer;
