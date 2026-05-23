import { Link } from 'react-router-dom';
import { Shield, Clock, Star, Users, Award, Heart, ArrowRight, Wrench } from 'lucide-react';

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Founder', img: 'https://i.pravatar.cc/150?img=47', bio: '10+ years in home services industry' },
  { name: 'Michael Chen', role: 'CTO', img: 'https://i.pravatar.cc/150?img=33', bio: 'Expert in platform architecture' },
  { name: 'Emily Davis', role: 'Head of Operations', img: 'https://i.pravatar.cc/150?img=45', bio: 'Ensures quality at every step' },
  { name: 'Robert Wilson', role: 'Lead Designer', img: 'https://i.pravatar.cc/150?img=12', bio: 'Creates intuitive experiences' },
];

const values = [
  { icon: Shield, title: 'Trust & Safety', desc: 'Every worker is background-checked and verified before joining our platform.', color: 'bg-blue-100 text-blue-600' },
  { icon: Star, title: 'Quality First', desc: 'We maintain high standards with a rigorous review and rating system.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Clock, title: 'Reliability', desc: 'On-time service guaranteed or your money back. Simple as that.', color: 'bg-green-100 text-green-600' },
  { icon: Heart, title: 'Customer Care', desc: '24/7 support to resolve any issue. Your satisfaction is our mission.', color: 'bg-pink-100 text-pink-600' },
];

const milestones = [
  { year: '2020', event: 'DailyNeeds founded in San Francisco' },
  { year: '2021', event: 'Reached 1,000 verified workers' },
  { year: '2022', event: 'Expanded to 50+ cities nationwide' },
  { year: '2023', event: '100,000 happy customers served' },
  { year: '2024', event: 'Launched mobile app & AI matching' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
            <Award className="w-4 h-4" /> Trusted by 100,000+ customers
          </div>
          <h1 className="text-5xl font-bold mb-6">We're on a Mission to Make<br /><span className="text-yellow-400">Home Services Simple</span></h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">DailyNeeds connects homeowners with skilled, vetted professionals for every home service need — fast, reliable, and affordable.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100K+', label: 'Happy Customers' },
              { value: '500+', label: 'Expert Workers' },
              { value: '50K+', label: 'Jobs Completed' },
              { value: '4.9★', label: 'Average Rating' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-bold text-blue-600 mb-1">{s.value}</div>
                <div className="text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Core Values</h2>
            <p className="text-gray-500 text-lg">What drives everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Meet Our Team</h2>
            <p className="text-gray-500">The passionate people behind DailyNeeds</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(m => (
              <div key={m.name} className="text-center bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all">
                <img src={m.img} alt={m.name} className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white shadow-md" />
                <h3 className="font-bold text-gray-800">{m.name}</h3>
                <div className="text-blue-600 font-medium text-sm mb-2">{m.role}</div>
                <p className="text-gray-400 text-xs">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-blue-200" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-6 pl-2">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md z-10">
                    {m.year}
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1 shadow-sm border border-gray-100 mt-1">
                    <p className="text-gray-700 font-medium">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience DailyNeeds?</h2>
          <p className="text-blue-100 mb-8">Join thousands of satisfied customers today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
              Browse Services <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-400 transition-colors border border-blue-400">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
