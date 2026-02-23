import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Sparkles, Moon, Sun, BookOpen, 
  MessageSquare, Instagram, Phone, Settings as SettingsIcon,
  ChevronRight, ArrowRight, Star, Users, Calendar,
  Clock, CheckCircle2, AlertCircle, Trash2, Send,
  Heart, Coffee, Leaf, Volume2, Play, Pause, Music
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Post, Settings, Booking } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// --- Components ---

const Navbar = ({ onAdminClick }: { onAdminClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '홈', href: '#home' },
    { name: '소개', href: '#about' },
    { name: '서비스', href: '#services' },
    { name: '커뮤니티', href: '#board' },
    { name: '문의', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-cream/90 backdrop-blur-lg py-4 border-b border-zinc-200' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#home" className="text-2xl font-serif font-bold tracking-tighter flex items-center gap-2 text-primary">
          <Heart className="fill-current w-6 h-6" />
          <span>고마움</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.name} href={item.href} className="nav-link text-base">{item.name}</a>
          ))}
          <button onClick={onAdminClick} className="p-2 text-zinc-400 hover:text-primary transition-colors">
            <SettingsIcon size={20} />
          </button>
          <a href="#contact" className="btn-primary py-3 px-6 text-sm">상담 예약하기</a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-cream border-b border-zinc-200 p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-xl font-medium py-3 border-b border-zinc-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <button onClick={() => { onAdminClick(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-zinc-400 py-3">
                <SettingsIcon size={20} /> 관리자
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HealingAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playHealingMessage = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const prompt = "당신의 운명을 조용히 비추는 따뜻한 위로의 메시지를 100자 내외로 작성해주세요. 부드럽고 느긋한 말투로, 듣는 이에게 평온함을 주는 내용이어야 합니다.";
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully and calmly: ${prompt}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        
        newAudio.onended = () => setIsPlaying(false);
        newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio generation failed", error);
      alert("오디오를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={playHealingMessage}
        disabled={isLoading}
        className="flex items-center gap-3 bg-white shadow-xl border border-zinc-200 px-6 py-4 rounded-full text-zinc-800 font-medium hover:bg-zinc-50 transition-all"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={20} className="text-primary" />
        ) : (
          <Volume2 size={20} className="text-primary" />
        )}
        <span className="text-sm md:text-base">따뜻한 위로 듣기</span>
      </motion.button>
    </div>
  );
};

const Hero = ({ settings }: { settings: Settings }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-apricot/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            Healing & Destiny Counseling
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8 text-zinc-900 whitespace-pre-line">
            {settings.hero_title || "당신의 운명을 조용히 비추는\n따뜻한 상담"}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mb-10 leading-relaxed font-medium">
            마음을 편안하게 감싸주는 힐링 공간.<br />
            MZ세대부터 실버세대까지, 모두를 위한 따뜻한 운명 상담소입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a href="#contact" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg">
              상담 예약하기 <ArrowRight size={20} />
            </a>
            <a href="#services" className="btn-outline w-full sm:w-auto text-lg">
              서비스 둘러보기
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000" 
              alt="Healing Forest" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 glass-card p-8 max-w-xs shadow-xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center text-primary">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200" 
                  alt="상담사 고마움" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="font-bold text-lg">상담사 고마움</p>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              "따뜻한 숲의 기운과 함께 당신의 이야기를 들려주세요."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-300"
      >
        <div className="w-8 h-12 border-2 border-zinc-200 rounded-full flex justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

const ServiceSection = () => {
  const services = [
    {
      title: "사주 운명 상담",
      desc: "태어난 기운을 분석하여 삶의 흐름을 함께 짚어봅니다.",
      icon: <Leaf className="w-10 h-10 text-primary" />,
      features: ["평생운세", "직업/재물운", "궁합/인연"]
    },
    {
      title: "타로 마음 치유",
      desc: "현재의 고민을 카드로 풀어내어 마음의 위로를 전합니다.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      features: ["연애운", "속마음", "심리 치유"]
    },
    {
      title: "전문 교육 & 강연",
      desc: "사주와 타로를 체계적으로 배우고 싶은 분들을 위한 전문 과정을 운영합니다.",
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      features: ["사주 1:1 교육", "타로 1:1 교육", "기업 및 기관 강의"]
    }
  ];

  return (
    <section id="services" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-zinc-900">제공 서비스</h2>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            MZ도, 부모님도, 어르신도 —<br />
            모두를 위한 따뜻한 운명 상담소입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card p-10 group text-center"
            >
              <div className="mb-8 p-6 bg-primary/5 rounded-full w-fit mx-auto group-hover:bg-primary/10 transition-colors">
                {s.icon}
              </div>
              <h3 className="text-2xl font-bold mb-6 text-zinc-900">{s.title}</h3>
              <p className="text-zinc-600 mb-10 leading-relaxed text-lg">{s.desc}</p>
              <ul className="space-y-4 inline-block text-left">
                {s.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-zinc-700 font-medium">
                    <CheckCircle2 size={20} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BoardSection = ({ posts }: { posts: Post[] }) => {
  return (
    <section id="board" className="py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-zinc-900">커뮤니티 & 소식</h2>
            <p className="text-xl text-zinc-500">고마움 상담소의 새로운 소식과 유익한 정보를 확인하세요.</p>
          </div>
          <a href="#" className="btn-outline py-3 px-8 text-base flex items-center gap-2">
            전체보기 <ChevronRight size={20} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.length > 0 ? posts.map((post) => (
            <div key={post.id} className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={post.image_url || `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800&seed=${post.id}`} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-sm font-bold text-primary shadow-sm">
                  {post.category || "공지사항"}
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                <p className="text-zinc-500 text-lg line-clamp-2 mb-8 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium pt-6 border-t border-zinc-50">
                  <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2"><Users size={16} /> 관리자</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-zinc-100">
              <p className="text-zinc-300 text-xl">등록된 게시물이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ReviewSection = () => {
  const reviews = [
    { name: "김*희", content: "마음이 너무 답답했는데, 상담사님의 따뜻한 말씀 한마디에 큰 위로를 얻었습니다. 정말 감사합니다.", date: "2024.03.15" },
    { name: "이*준", content: "MZ세대인 저도 부담 없이 상담받을 수 있었어요. 제 고민을 진심으로 들어주셔서 감동했습니다.", date: "2024.03.10" },
    { name: "박*자", content: "부모님 모시고 왔는데 너무 좋아하시네요. 어르신들 눈높이에 맞춰 설명해주셔서 정말 좋았습니다.", date: "2024.03.05" }
  ];

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-zinc-900">따뜻한 후기</h2>
          <p className="text-xl text-zinc-500">상담을 통해 마음의 평온을 찾은 분들의 이야기입니다.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-10 bg-[#FFF9F0] rounded-3xl shadow-sm relative transform rotate-1 hover:rotate-0 transition-transform duration-500"
              style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/lined-paper.png')" }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Star className="fill-current" />
              </div>
              <p className="font-hand text-2xl text-zinc-700 mb-8 leading-relaxed min-h-[120px]">
                "{r.content}"
              </p>
              <div className="flex justify-between items-center text-zinc-400 font-medium">
                <span className="text-lg">{r.name} 님</span>
                <span className="text-sm">{r.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = ({ onBookingSubmit }: { onBookingSubmit: (b: any) => Promise<void> }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '사주 운명 상담',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onBookingSubmit(formData);
      setIsSuccess(true);
      setFormData({ name: '', phone: '', service: '사주 운명 상담', date: '', time: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      alert("예약 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 text-zinc-900">상담 예약 및 문의</h2>
            <p className="text-xl text-zinc-600 mb-16 leading-relaxed">
              당신의 소중한 시간을 위해 예약제로 운영됩니다.<br />
              원하시는 날짜와 시간을 선택하여 예약 신청을 남겨주시면 확인 후 따뜻하게 연락드리겠습니다.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-8 p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                <div className="p-5 bg-primary/10 rounded-2xl text-primary">
                  <Phone size={32} />
                </div>
                <div>
                  <p className="text-base text-zinc-400 mb-1">전화 문의</p>
                  <p className="text-2xl font-bold text-zinc-800">010-1234-5678</p>
                </div>
              </div>
              <div className="flex items-center gap-8 p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
                <div className="p-5 bg-primary/10 rounded-2xl text-primary">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <p className="text-base text-zinc-400 mb-1">카카오톡</p>
                  <a 
                    href="https://open.kakao.com/o/sQNIWdhi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-zinc-800 hover:text-primary transition-colors"
                  >
                    오픈채팅 바로가기
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-zinc-100">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-bold mb-6">예약 신청 완료</h3>
                <p className="text-xl text-zinc-500">신청하신 내용을 확인 후 빠른 시일 내에 연락드리겠습니다. 감사합니다.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-10 text-primary font-bold text-lg hover:underline">다른 예약 신청하기</button>
              </motion.div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-bold mb-3 text-zinc-700">성함</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg" 
                      placeholder="홍길동" 
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold mb-3 text-zinc-700">연락처</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg" 
                      placeholder="010-0000-0000" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-bold mb-3 text-zinc-700">상담 종류</label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg appearance-none"
                  >
                    <option>사주 운명 상담</option>
                    <option>타로 마음 치유</option>
                    <option>전문 교육 및 강연</option>
                    <option>기업 및 기관 강의</option>
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-bold mb-3 text-zinc-700">희망 날짜</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold mb-3 text-zinc-700">희망 시간</label>
                    <input 
                      required
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-bold mb-3 text-zinc-700">문의 내용</label>
                  <textarea 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg" 
                    placeholder="상담받고 싶은 내용을 간단히 적어주세요."
                  ></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 text-xl disabled:opacity-50">
                  {isSubmitting ? "처리 중..." : "예약 신청하기"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const AdminDashboard = ({ 
  settings, 
  posts, 
  bookings,
  onClose, 
  onUpdateSettings, 
  onAddPost, 
  onDeletePost,
  onUpdateBookingStatus,
  onDeleteBooking
}: { 
  settings: Settings, 
  posts: Post[], 
  bookings: Booking[],
  onClose: () => void,
  onUpdateSettings: (s: Partial<Settings>) => void,
  onAddPost: (p: Partial<Post>) => void,
  onDeletePost: (id: number) => void,
  onUpdateBookingStatus: (id: number, status: string) => void,
  onDeleteBooking: (id: number) => void
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'posts' | 'bookings'>('bookings');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', image_url: '' });

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-zinc-200 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-800">
            <SettingsIcon className="text-primary" /> 관리자 대시보드
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"><X /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-zinc-100 p-6 space-y-3 bg-zinc-50/30">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center gap-3 ${activeTab === 'bookings' ? 'bg-primary text-white shadow-md font-bold' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <Calendar size={20} /> 예약 관리
            </button>
            <button 
              onClick={() => setActiveTab('posts')}
              className={`w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center gap-3 ${activeTab === 'posts' ? 'bg-primary text-white shadow-md font-bold' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <BookOpen size={20} /> 게시물 관리
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-primary text-white shadow-md font-bold' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <SettingsIcon size={20} /> 사이트 설정
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-10 overflow-y-auto bg-white">
            {activeTab === 'bookings' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold mb-8 text-zinc-800">최근 예약 신청</h3>
                <div className="space-y-6">
                  {bookings.length > 0 ? bookings.map(booking => (
                    <div key={booking.id} className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl font-bold text-zinc-800">{booking.name}</span>
                            <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold ${
                              booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : 
                              booking.status === 'cancelled' ? 'bg-red-50 text-white' : 
                              'bg-yellow-400 text-white'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-zinc-500 font-medium">{booking.phone} | {booking.service}</p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                            className="p-3 bg-white text-primary border border-zinc-100 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="승인"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                            onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                            className="p-3 bg-white text-red-500 border border-zinc-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="취소"
                          >
                            <X size={20} />
                          </button>
                          <button 
                            onClick={() => onDeleteBooking(booking.id)}
                            className="p-3 bg-white text-zinc-300 border border-zinc-100 rounded-xl hover:bg-zinc-100 hover:text-zinc-500 transition-all shadow-sm"
                            title="삭제"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-zinc-500 mb-6 font-medium">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-primary" /> {booking.date}
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-primary" /> {booking.time}
                        </div>
                      </div>
                      {booking.message && (
                        <div className="p-5 bg-white rounded-2xl text-zinc-600 italic border border-zinc-100">
                          "{booking.message}"
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-32 text-zinc-300 text-xl">예약 신청이 없습니다.</div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-8 text-zinc-800">테마 및 기본 정보</h3>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-zinc-500 font-bold mb-3">포인트 컬러</label>
                      <div className="flex gap-6 items-center">
                        <input 
                          type="color" 
                          value={settings.primary_color} 
                          onChange={(e) => onUpdateSettings({ primary_color: e.target.value })}
                          className="w-16 h-16 rounded-2xl bg-transparent border-none cursor-pointer shadow-md"
                        />
                        <span className="font-mono text-lg font-bold text-zinc-400">{settings.primary_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-bold mb-3">사이트 이름</label>
                      <input 
                        type="text" 
                        value={settings.site_name} 
                        onChange={(e) => onUpdateSettings({ site_name: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-bold mb-3">히어로 타이틀</label>
                      <textarea 
                        value={settings.hero_title} 
                        onChange={(e) => onUpdateSettings({ hero_title: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-lg"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-bold mb-8 text-zinc-800">새 게시물 작성</h3>
                  <div className="space-y-6 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                    <input 
                      type="text" 
                      placeholder="제목" 
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-lg focus:border-primary outline-none"
                    />
                    <textarea 
                      placeholder="내용" 
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-lg focus:border-primary outline-none"
                      rows={4}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <input 
                        type="text" 
                        placeholder="카테고리" 
                        value={newPost.category}
                        onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                        className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-lg focus:border-primary outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="이미지 URL" 
                        value={newPost.image_url}
                        onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
                        className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 text-lg focus:border-primary outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        onAddPost(newPost);
                        setNewPost({ title: '', content: '', category: '', image_url: '' });
                      }}
                      className="btn-primary w-full py-5 text-xl"
                    >
                      게시물 등록
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-8 text-zinc-800">게시물 목록</h3>
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                        <div>
                          <p className="font-bold text-lg text-zinc-800">{post.title}</p>
                          <p className="text-sm text-zinc-400 font-medium">{post.category} | {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => onDeletePost(post.id)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [settings, setSettings] = useState<Settings>({
    primary_color: '#2ECC71',
    site_name: '고마움의 운명상담소',
    hero_title: '운명의 길을 비추는 고마움의 상담소'
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, postsRes, bookingsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/posts'),
        fetch('/api/bookings')
      ]);
      const settingsData = await settingsRes.json();
      const postsData = await postsRes.json();
      const bookingsData = await bookingsRes.json();
      
      setSettings(settingsData);
      setPosts(postsData);
      setBookings(bookingsData);
      
      // Apply primary color to CSS variable
      document.documentElement.style.setProperty('--primary-color', settingsData.primary_color);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (newSettings.primary_color) {
      document.documentElement.style.setProperty('--primary-color', newSettings.primary_color);
    }
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: updated })
    });
  };

  const addPost = async (post: Partial<Post>) => {
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    fetchData();
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addBooking = async (booking: Partial<Booking>) => {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    fetchData();
  };

  const updateBookingStatus = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const deleteBooking = async (id: number) => {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-cream selection:bg-primary selection:text-white">
      <Navbar onAdminClick={() => setIsAdminOpen(true)} />
      
      <main>
        <Hero settings={settings} />
        
        {/* About Section */}
        <section id="about" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-cream">
                  <img 
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000" 
                    alt="상담사 고마움" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 p-10 bg-white rounded-3xl shadow-2xl max-w-xs border border-zinc-100">
                  <p className="text-primary font-hand text-3xl mb-4">"답을 주기보다, 길을 함께 찾아드립니다."</p>
                  <p className="font-bold text-xl text-zinc-800">대표 상담사 고마움</p>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 text-zinc-900">고마움의 철학</h2>
                <div className="space-y-8 text-zinc-600 leading-relaxed text-xl">
                  <p>
                    '고마움의 운명상담소'는 당신의 마음을 편안하게 감싸주는 힐링 공간입니다. 
                    단순히 미래를 맞추는 것을 넘어, 당신이 가진 고유한 빛을 발견할 수 있도록 돕습니다.
                  </p>
                  <p>
                    부드러운 자연의 기운과 함께, 
                    누구나 부담 없이 머물며 자신의 이야기를 나누고 
                    잔잔한 희망을 얻어갈 수 있는 따뜻한 가이드가 되겠습니다.
                  </p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-4">
                  {["따뜻함", "포근함", "신뢰감", "자연", "위로"].map((tag, i) => (
                    <span key={i} className="px-6 py-2 bg-zinc-50 text-zinc-500 rounded-full text-base font-medium border border-zinc-100 italic">
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceSection />
        <ReviewSection />
        <BoardSection posts={posts} />
        <ContactSection onBookingSubmit={addBooking} />
      </main>

      <HealingAudio />

      <footer className="py-20 border-t border-zinc-200 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="text-3xl font-serif font-bold tracking-tighter flex items-center gap-3 text-primary">
              <Heart className="fill-current w-8 h-8" />
              <span>고마움</span>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-lg text-zinc-500 font-medium">
              <a href="#" className="hover:text-primary transition-colors">이용약관</a>
              <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-primary transition-colors">공지사항</a>
            </div>
            <div className="flex gap-6">
              <a href="#" className="p-4 bg-white rounded-full shadow-sm hover:shadow-md hover:text-primary transition-all border border-zinc-100"><Instagram size={24} /></a>
              <a 
                href="https://open.kakao.com/o/sQNIWdhi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white rounded-full shadow-sm hover:shadow-md hover:text-primary transition-all border border-zinc-100"
              >
                <MessageSquare size={24} />
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-zinc-400">
            <p>© 2025 고마움의 운명상담소. All rights reserved.</p>
            <p className="mt-3">사업자등록번호: 000-00-00000 | 대표: 고마움</p>
          </div>
        </div>
      </footer>

      {isAdminOpen && (
        <AdminDashboard 
          settings={settings} 
          posts={posts} 
          bookings={bookings}
          onClose={() => setIsAdminOpen(false)}
          onUpdateSettings={updateSettings}
          onAddPost={addPost}
          onDeletePost={deletePost}
          onUpdateBookingStatus={updateBookingStatus}
          onDeleteBooking={deleteBooking}
        />
      )}
    </div>
  );
}
