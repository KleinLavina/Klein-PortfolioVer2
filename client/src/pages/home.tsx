import { Shell } from "@/components/layout/shell";
import { Section, SectionHeader } from "@/components/ui/section";
import { useProjects } from "@/hooks/use-projects";
import { useAchievements } from "@/hooks/use-achievements";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ExternalLink, Github, Code, Database, MonitorSmartphone, Layers, Server, TerminalSquare, Mail, MessageSquare, FolderGit2, Trophy } from "lucide-react";
import { useForm } from "react-form";
import { useState } from "react";
import { format } from "date-fns";

const SKILLS = {
  "Frontend": [
    { name: "HTML", icon: Code, color: "text-orange-500" },
    { name: "CSS", icon: Layers, color: "text-blue-500" },
    { name: "JavaScript", icon: TerminalSquare, color: "text-yellow-400" },
    { name: "TypeScript", icon: TerminalSquare, color: "text-blue-600" },
    { name: "React", icon: MonitorSmartphone, color: "text-cyan-500" },
    { name: "Next.js", icon: MonitorSmartphone, color: "text-foreground" },
  ],
  "Backend": [
    { name: "Django", icon: Server, color: "text-green-600" },
    { name: "PHP", icon: Server, color: "text-indigo-400" },
  ],
  "Databases": [
    { name: "MySQL", icon: Database, color: "text-blue-500" },
    { name: "PostgreSQL", icon: Database, color: "text-blue-400" },
  ],
  "Programming Languages": [
    { name: "Java", icon: Code, color: "text-red-500" },
    { name: "Python", icon: Code, color: "text-blue-400" },
    { name: "R", icon: Code, color: "text-blue-600" },
  ],
  "Tools & Platforms": [
    { name: "VS Code", icon: Code, color: "text-blue-500" },
    { name: "Git", icon: FolderGit2, color: "text-orange-600" },
    { name: "GitHub", icon: FolderGit2, color: "text-foreground" },
    { name: "Postman", icon: Layers, color: "text-orange-500" },
    { name: "Discord", icon: MessageSquare, color: "text-indigo-500" },
  ],
};

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
      {/* HERO SECTION */}
      <Section id="home" className="justify-center min-h-screen py-4 pt-0">
        <div className="relative">
          <div className="absolute top-0 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
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
              <Button size="lg" className="rounded-full px-8 bg-gradient-brand text-white hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all h-12 text-base font-bold">
                <a href="#projects">View My Work</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 border-2 hover:bg-primary/5 hover:text-primary transition-all h-12 text-base font-bold glass-card">
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
          <div className="relative">
            {/* placeholder tech workspace image */}
            <div className="absolute inset-0 bg-gradient-brand rounded-3xl transform rotate-3 opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" 
              alt="Workspace" 
              className="rounded-3xl relative z-10 shadow-2xl border border-border/50 object-cover w-full h-[400px]"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-foreground">Innovating through Code</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Based in the digital realm, I specialize in the MERN stack and modern React frameworks. My journey in tech started with a curiosity about how things work on the internet, which quickly evolved into a passion for building them.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When I'm not coding, I'm exploring new technologies, contributing to open-source, or optimizing workflows to create seamless user experiences.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="p-4 rounded-2xl glass-card flex-1">
                <div className="text-3xl font-black text-primary">3+</div>
                <div className="text-sm font-semibold text-muted-foreground mt-1">Years Exp.</div>
              </div>
              <div className="p-4 rounded-2xl glass-card flex-1">
                <div className="text-3xl font-black text-secondary">50+</div>
                <div className="text-sm font-semibold text-muted-foreground mt-1">Projects</div>
              </div>
              <div className="p-4 rounded-2xl glass-card flex-1">
                <div className="text-3xl font-black text-accent">100%</div>
                <div className="text-sm font-semibold text-muted-foreground mt-1">Commitment</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SKILLS SECTION */}
      <Section id="skills">
        <SectionHeader 
          title="Technical Arsenal" 
          subtitle="Technologies and tools I use to bring ideas to life." 
        />
        <div className="space-y-12">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="h-1 w-12 bg-gradient-brand rounded-full"></span>
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="p-6 rounded-3xl glass-card flex flex-col items-center justify-center gap-4 hover-glow cursor-default">
                      <div className={`p-4 rounded-full bg-background border border-border shadow-inner group-hover:scale-110 transition-transform duration-300 ${skill.color}`}>
                        <skill.icon size={32} strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-foreground text-center">{skill.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden rounded-3xl border-border/50 hover:border-primary/50 transition-colors duration-300 group shadow-lg hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
                    <img 
                      src={project.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="relative z-20 -mt-6">
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

      {/* ACHIEVEMENTS SECTION */}
      <Section id="achievements">
        <SectionHeader 
          title="Achievements" 
          subtitle="Milestones and recognition along my developer journey." 
        />
        
        {achievementsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : !achievements || achievements.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-muted-foreground">Journey just beginning.</h3>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-[19px] sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent opacity-30 transform sm:-translate-x-1/2 rounded-full"></div>
            
            <div className="space-y-12 relative z-10">
              {achievements.map((achievement, i) => (
                <motion.div 
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-8 ${i % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}
                >
                  <div className="hidden sm:block sm:w-1/2"></div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[8px] sm:left-1/2 w-6 h-6 rounded-full bg-background border-4 border-primary transform sm:-translate-x-1/2 shadow-[0_0_15px_rgba(53,211,97,0.5)] z-20"></div>
                  
                  <Card className={`w-full sm:w-1/2 ml-12 sm:ml-0 glass-card rounded-3xl ${i % 2 === 0 ? 'sm:mr-12' : 'sm:ml-12'}`}>
                    <CardHeader className="pb-2">
                      <div className="text-sm font-bold text-primary mb-2">{achievement.date}</div>
                      <CardTitle className="text-xl">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{achievement.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* CHAT / CONTACT SECTION */}
      <Section id="chat">
        <SectionHeader 
          title="Let's Connect" 
          subtitle="Drop a message in the chat room or send me a direct inquiry." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* Form Side */}
          <Card className="h-full flex flex-col glass-card rounded-3xl overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="text-primary" /> Send a Message
              </CardTitle>
              <CardDescription>Fill out the form below and I'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleMessageSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Name</label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="rounded-xl h-12 bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Email</label>
                  <Input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="rounded-xl h-12 bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Message</label>
                  <Textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Hi Klein, I'd like to collaborate..." 
                    className="rounded-xl min-h-[120px] resize-none bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={createMessage.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-brand text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {createMessage.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="mr-2 h-5 w-5" /> Send Message</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Chat Room Side */}
          <Card className="h-full flex flex-col glass-card rounded-3xl overflow-hidden border-t-4 border-t-accent">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-accent" /> Public Chat Room
                </div>
                <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Live
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse bg-gradient-to-b from-transparent to-muted/10">
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <MessageSquare className="h-12 w-12 mb-2" />
                  <p>No messages yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={msg.id} 
                      className="bg-background rounded-2xl rounded-tl-none p-4 shadow-sm border border-border"
                    >
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-foreground">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{msg.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </Shell>
  );
}
