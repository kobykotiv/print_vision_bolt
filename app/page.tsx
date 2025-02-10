'use client';

    import React from 'react';
    import MarkdownRenderer from '@/components/MarkdownRenderer';

    const Home = () => {
      return (
        <div>
          <h1>Markdown Content</h1>
          {/* Example Usage for Homepage Sections */}
          <section>
            <h2>Pricing</h2>
            <MarkdownRenderer filename="pricing.md" />
          </section>

          <section>
            <h2>Blog</h2>
            <MarkdownRenderer filename="blog.md" />
          </section>

          <section>
            <h2>Learn More</h2>
            <MarkdownRenderer filename="learn-more.md" />
          </section>

          <section>
            <h2>FAQ</h2>
            <MarkdownRenderer filename="faq.md" />
          </section>

          <section>
            <h2>Testimonials</h2>
            <MarkdownRenderer filename="testimonials.md" />
          </section>
        </div>
      );
    };

    export default Home;
