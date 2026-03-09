import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";

const timelineData = [
  {
    year: "2022",
    title: "Began Bachelor of Science in Information Technology",
    description: "Enrolled in the Bachelor of Science in Information Technology (BSIT) program at Saint Joseph College. Started learning HTML, CSS, and basic JavaScript through academic classes, W3Schools, and online tutorials. Built my first static web pages and practiced responsive layouts and design fundamentals. Learned CSS Flexbox and Grid, strengthening my ability to structure modern web layouts. Introduced to Java programming and fundamental Object-Oriented Programming (OOP) concepts such as encapsulation and inheritance. Achieved Dean's List recognition during the first semester.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
    techStack: ["HTML", "CSS", "JavaScript", "Java"],
  },
  {
    year: "2023 – 2024",
    title: "System Design and Database Foundations",
    description: "Learned system modeling using Data Flow Diagrams (DFD) to understand how data moves within software systems. Studied relational database design and data structuring principles, including normalization and database architecture. Built and managed databases using MySQL. Gained knowledge in digital policies, responsible technology use, and ethical computing practices.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80",
    techStack: ["MySQL", "DFD", "Database Design"],
  },
  {
    year: "2024 – 2025",
    title: "Backend Development and Web Application Building",
    description: "Learned PHP and the use of XAMPP through coursework and online tutorials. Began developing dynamic web applications, including an e-commerce style website with features such as: User CRUD operations, Add-to-cart functionality, Product data management and manipulation, Authentication systems, CAPTCHA security, Protection against SQL Injection attacks. Developed a furniture e-commerce website called Cracken Furniture. Created a customized variant called CrackenGearFits for classmates as a paid service. Deployed and hosted projects using InfinityFree hosting. Additional learning during this period: Studied Python and completed programming exercises. Introduced to GitHub for project hosting and collaboration. Self-learned Git version control to manage and track code changes.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    techStack: ["PHP", "XAMPP", "Python", "Git", "GitHub"],
  },
  {
    year: "2025 – 2026",
    title: "Modern Web Development and Full-Stack Systems",
    description: "Learned React and Vite for modern frontend development. Built a web-based chatbot application called J-Gear, designed for office and business use. Developed the chatbot for Tatak Josephinian, a school merchandise business founded by the BSBA department at Saint Joseph College. Implemented the chatbot using React JSX and keyword-based response logic. Expanded backend development skills: Learned the Django web framework. Developed a web-based system called RDFS as a capstone project, built using Django and HTML templates. Created another Django-based system called PENROWISE. Proposed and designed a School Announcement Management System for Tag-os Elementary School, developed using React.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    techStack: ["React", "Vite", "Django", "JSX"],
  },
];

export function DeveloperTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Observer for timeline container visibility
    const containerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsTimelineVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      containerObserver.observe(containerRef.current);
    }

    // Observer for individual timeline items
    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = timelineRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      { threshold: 0.6, rootMargin: "-100px 0px" }
    );

    timelineRefs.current.forEach((ref) => {
      if (ref) itemObserver.observe(ref);
    });

    return () => {
      containerObserver.disconnect();
      itemObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto">
      {/* Mini Floating Image for Mobile (below 690px) */}
      {isTimelineVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="sm:hidden fixed left-4 top-24 z-30 w-20 h-20 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30 bg-background"
        >
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            src={timelineData[activeIndex].image}
            alt={timelineData[activeIndex].title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Timeline Line */}
      <div className="absolute left-[19px] sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent opacity-30 transform sm:-translate-x-1/2 rounded-full"></div>
      
      <div className="space-y-24 relative z-10">
        {timelineData.map((item, i) => (
          <motion.div
            key={i}
            ref={(el) => (timelineRefs.current[i] = el)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-8 ${
              i % 2 === 0 ? "sm:flex-row-reverse" : ""
            }`}
          >
            {/* Empty Space with Floating Sticky Image */}
            <div className="hidden sm:block sm:w-1/2 relative min-h-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                className="sticky top-24 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20 mx-auto"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            </div>

            {/* Timeline Dot */}
            <div className="absolute left-[8px] sm:left-1/2 w-6 h-6 rounded-full bg-background border-4 border-primary transform sm:-translate-x-1/2 shadow-[0_0_15px_rgba(53,211,97,0.5)] z-20"></div>

            {/* Content Card */}
            <div className={`w-full sm:w-1/2 ml-12 sm:ml-0 ${i % 2 === 0 ? "sm:mr-12" : "sm:ml-12"}`}>
              {/* Timeline Card */}
              <Card className="glass-card rounded-[2rem] border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="text-xs font-black uppercase tracking-widest text-primary mb-2 bg-primary/10 w-fit px-3 py-1 rounded-full">
                    {item.year}
                  </div>
                  <CardTitle className="text-2xl font-black leading-tight">
                    {item.title}
                  </CardTitle>
                  
                  {/* Tech Stack Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-secondary/10 text-secondary-foreground rounded-lg px-2 py-1 text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
