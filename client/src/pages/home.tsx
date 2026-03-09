import { Shell } from "@/components/layout/shell";
import { Section, SectionHeader } from "@/components/ui/section";
import { SkillIndicator, SkillLegend } from "@/components/ui/skill-indicator";
import { GithubContributions } from "@/components/github-contributions";
import { DeveloperTimeline } from "@/components/developer-timeline";
import { useProjects } from "@/hooks/use-projects";
import { useAchievements } from "@/hooks/use-achievements";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ExternalLink, Github, Code, Database, MonitorSmartphone, Layers, Server, TerminalSquare, Mail, MessageSquare, FolderGit2, Trophy, Lightbulb, Users, Wrench, Zap, BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const SKILLS = {
  "Frontend": [
    { name: "HTML", icon: Code, color: "text-orange-500", level: 4 as const },
    { name: "CSS", icon: Layers, color: "text-blue-500", level: 4 as const },
    { name: "JavaScript", icon: TerminalSquare, color: "text-yellow-400", level: 3 as const },
    { name: "TypeScript", icon: TerminalSquare, color: "text-blue-600", level: 2 as const },
    { name: "React", icon: MonitorSmartphone, color: "text-cyan-500", level: 2 as const },
    { name: "Next.js", icon: MonitorSmartphone, color: "text-foreground", level: 2 as const },
    { name: "Tailwind", icon: Layers, color: "text-cyan-400", level: 2 as const },
    { name: "Bootstrap", icon: Layers, color: "text-purple-500", level: 2 as const },
  ],
  "Backend": [
    { name: "Django", icon: Server, color: "text-green-600", level: 3 as const },
    { name: "PHP", icon: Server, color: "text-indigo-400", level: 3 as const },
  ],
  "Databases": [
    { name: "MySQL", icon: Database, color: "text-blue-500", level: 3 as const },
    { name: "PostgreSQL", icon: Database, color: "text-blue-400", level: 3 as const },
  ],
  "Programming Languages": [
    { name: "Java", icon: Code, color: "text-red-500", level: 1 as const },
    { name: "Python", icon: Code, color: "text-blue-400", level: 3 as const },
    { name: "R", icon: Code, color: "text-blue-600", level: 1 as const },
  ],
  "Tools & Platforms": [
    { name: "VS Code", icon: Code, color: "text-blue-500", level: 3 as const },
    { name: "Git", icon: FolderGit2, color: "text-orange-600", level: 3 as const },
    { name: "GitHub", icon: FolderGit2, color: "text-foreground", level: 3 as const },
    { name: "Postman", icon: Layers, color: "text-orange-500", level: 1 as const },
    { name: "Discord", icon: MessageSquare, color: "text-indigo-500", level: 3 as const },
    { name: "XAMPP", icon: Server, color: "text-orange-600", level: 3 as const },
    { name: "Cloudinary", icon: Layers, color: "text-blue-600", level: 1 as const },
    { name: "Replit", icon: Code, color: "text-orange-500", level: 2 as const },
    { name: "Render", icon: Server, color: "text-purple-600", level: 2 as const },
    { name: "Figma", icon: Layers, color: "text-pink-500", level: 2 as const },
    { name: "Canva", icon: Layers, color: "text-cyan-500", level: 2 as const },
  ],
  "Specializations": [
    { name: "Frontend Development", icon: MonitorSmartphone, color: "text-cyan-500", level: 3 as const, description: "Building user interfaces" },
    { name: "Backend Development", icon: Server, color: "text-green-500", level: 3 as const, description: "Server-side logic" },
    { name: "Web Performance Optimization", icon: Zap, color: "text-yellow-500", level: 3 as const, description: "Speed & efficiency" },
    { name: "Software Architecture", icon: Layers, color: "text-purple-500", level: 2 as const, description: "System design" },
    { name: "AI-Assisted Development", icon: Lightbulb, color: "text-orange-500", level: 2 as const, description: "Productivity tools" },
  ],
};

const PROFESSIONAL_SKILLS = [
  { name: "Problem Solving", icon: Lightbulb, color: "text-yellow-400", description: "Analytical approach to complex challenges" },
  { name: "Team Collaboration", icon: Users, color: "text-blue-500", description: "Effective communication and teamwork" },
  { name: "Technical Troubleshooting", icon: Wrench, color: "text-orange-500", description: "Quick diagnosis and resolution" },
  { name: "Adaptability", icon: Zap, color: "text-purple-500", description: "Fast learner with new technologies" },
  { name: "Continuous Learning", icon: BookOpen, color: "text-green-500", description: "Always expanding knowledge" },
  { name: "Communication", icon: MessageCircle, color: "text-cyan-500", description: "Clear technical and non-technical communication" },
];

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const createMessage = useCreateMessage();

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMessage.mutate(formData, {
      onSuccess: () => setFormData({ name: "", email: "", message: "" })
    });
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 relative">
        {/* HERO SECTION */}
        <Section id="home" className="justify-center min-h-screen py-4 pt-0">
        <div className="relative">
          <div className="absolute top-0 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 border-primary/30 bg-primary/5 text-primary text-sm font-semibold rounded-full">
              👋 Welcome to my portfolio
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Hi, I'm <br />
              <span className="text-gradient">Klein F. Lavina</span>
            </h1>
            <h2 className="mt-4 text-xl sm:text-2xl font-bold text-muted-foreground">
              Crafting digital experiences as a <span className="text-foreground">Full Stack Developer</span>.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl leading-relaxed">
              I build scalable, modern, and beautiful web applications. 
              Passionate about turning complex problems into elegant, intuitive interfaces.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8 bg-gradient-brand text-white hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all h-14 text-lg font-bold">
                <a href="#projects">View My Work</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-2 hover:bg-primary/5 hover:text-primary transition-all h-14 text-lg font-bold glass-card border-white/10">
                <a href="#contact">Contact Me</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ABOUT SECTION */}
      <Section id="about">
        <SectionHeader 
          title="About Me" 
          subtitle="A brief introduction to who I am and what drives my passion for development." 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            {/* placeholder tech workspace image */}
            <div className="absolute inset-0 bg-gradient-brand rounded-3xl transform rotate-3 opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" 
              alt="Workspace" 
              className="rounded-3xl relative z-10 shadow-2xl border border-border/50 object-cover w-full h-[400px]"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-foreground">Innovating through Code</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Based in the digital realm, I specialize in the MERN stack and modern React frameworks. My journey in tech started with a curiosity about how things work on the internet, which quickly evolved into a passion for building them.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When I'm not coding, I'm exploring new technologies, contributing to open-source, or optimizing workflows to create seamless user experiences.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="p-6 rounded-3xl glass-card flex-1 text-center border-white/5">
                <div className="text-4xl font-black text-primary">3+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-2">Years Exp.</div>
              </div>
              <div className="p-6 rounded-3xl glass-card flex-1 text-center border-white/5">
                <div className="text-4xl font-black text-secondary">50+</div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-2">Projects</div>
              </div>
              <div className="p-6 rounded-3xl glass-card flex-1 text-center border-white/5">
                <div className="text-4xl font-black text-accent">100%</div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-2">Commitment</div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* SKILLS SECTION */}
      <Section id="skills">
        <SectionHeader 
          title="Technical Arsenal" 
          subtitle="Technologies and tools I use to bring ideas to life." 
        />
        
        {/* Skill Legend */}
        <SkillLegend />
        
        <div className="space-y-12">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="h-1 w-12 bg-gradient-brand rounded-full"></span>
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="p-3 rounded-xl glass-card flex flex-col items-center justify-center gap-2 hover-glow cursor-default">
                      <div className={`p-2 rounded-full bg-background border border-border shadow-inner group-hover:scale-110 transition-transform duration-300 ${skill.color}`}>
                        <skill.icon size={20} strokeWidth={1.5} />
                      </div>
                      <span className="font-medium text-xs text-foreground text-center leading-tight">{skill.name}</span>
                      {category === "Specializations" && 'description' in skill ? (
                        <p className="text-[10px] text-muted-foreground text-center leading-tight">{skill.description}</p>
                      ) : (
                        <SkillIndicator level={skill.level} className="w-full" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Professional Skills - Different Style */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="h-1 w-12 bg-gradient-brand rounded-full"></span>
              Professional Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROFESSIONAL_SKILLS.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                  className="group"
                >
                  <div className="p-4 rounded-2xl glass-card hover-glow cursor-default h-full flex items-center gap-4 border-white/5">
                    <div className={`p-3 rounded-xl bg-gradient-brand/10 border border-primary/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${skill.color}`}>
                      <skill.icon size={22} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base text-foreground mb-1">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* GITHUB CONTRIBUTIONS SECTION */}
      <Section id="github" className="!py-16">
        <GithubContributions />
      </Section>

      {/* PROJECTS SECTION */}
      <Section id="projects">
        <SectionHeader 
          title="Featured Projects" 
          subtitle="A selection of my recent work and technical accomplishments." 
        />
        
        {projectsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <FolderGit2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-muted-foreground">No projects listed yet.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col overflow-hidden rounded-[2rem] border-white/5 dark:border-white/10 hover:border-primary/50 transition-all duration-500 group shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 bg-card/30 backdrop-blur-xl">
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60"></div>
                    <img 
                      src={project.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <CardHeader className="relative z-20 -mt-12 bg-background/80 backdrop-blur-lg mx-4 rounded-2xl border border-white/5 shadow-xl">
                    <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.techStack.map(tech => (
                        <Badge key={tech} variant="secondary" className="bg-secondary/10 text-secondary-foreground rounded-lg px-2 py-1">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                  <CardFooter className="gap-4 pt-4 border-t border-border/50">
                    {project.liveUrl && (
                      <Button variant="default" size="sm" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                        </a>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noreferrer">
                          <Github className="mr-2 h-4 w-4" /> Source
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* DEVELOPER JOURNEY TIMELINE SECTION */}
      <Section id="timeline">
        <SectionHeader 
          title="Developer Journey Timeline" 
          subtitle="My path from learning web fundamentals to building full-stack applications." 
        />
        <DeveloperTimeline />
      </Section>
      </div>

      {/* CONTACT SECTION - Full Width */}
      <Section id="contact" className="!min-h-fit !py-0 relative overflow-hidden">
        {/* Curved Top Section */}
        <div className="relative h-32 bg-background">
          <svg 
            className="absolute bottom-0 left-0 w-full h-32" 
            viewBox="0 0 1440 120" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,64 C240,20 480,0 720,20 C960,40 1200,80 1440,64 L1440,120 L0,120 Z" 
              className="fill-primary"
            />
          </svg>
          
          {/* Repeating "Collaborate" Text */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="text-8xl font-black text-foreground whitespace-nowrap animate-marquee">
              Collaborate with me Collaborate with me Collaborate with me Collaborate with me Collaborate with me
            </div>
          </div>
        </div>

        {/* Curved Background Pattern */}
        <div className="absolute inset-0 top-32 bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden">
          {/* Animated Blobs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 py-20 text-center bg-gradient-to-br from-primary via-primary/90 to-secondary">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Connect with me on social media.
            </h2>
            
            {/* Social Icons */}
            <div className="flex justify-center gap-8">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noreferrer"
                className="p-5 bg-white rounded-2xl hover:scale-110 hover:-rotate-6 transition-all duration-300 shadow-2xl"
              >
                <Github className="h-10 w-10 text-foreground" />
              </a>
              <a 
                href="https://instagram.com/yourusername" 
                target="_blank" 
                rel="noreferrer"
                className="p-5 bg-white rounded-2xl hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-2xl"
              >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Contact Email */}
            <p className="text-xl text-white/90 font-medium">
              Contact me: <a href="mailto:your.email@example.com" className="underline hover:text-white transition-colors">your.email@example.com</a>
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 bg-transparent border-2 border-white text-white hover:bg-white hover:text-foreground transition-all h-12 text-base font-bold"
              >
                Resume
              </Button>
              <Button 
                size="lg" 
                className="rounded-full px-8 bg-white text-foreground hover:bg-white/90 transition-all h-12 text-base font-bold"
                asChild
              >
                <a href="mailto:your.email@example.com">Let's Talk</a>
              </Button>
            </div>

            {/* Footer Text */}
            <div className="pt-12">
              <p className="text-white/80 font-medium">
                © 2026 Klein F. Lavina <span className="mx-2">•</span> Designed by Corey Hu
              </p>
            </div>
          </motion.div>
        </div>
      </Section>
    </Shell>
  );
}
