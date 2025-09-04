import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FaPrayingHands } from 'react-icons/fa';
import mandirImg from "../assets/mandir.jpg";
import logo from "../assets/logo.png";
import { IoIosPeople } from 'react-icons/io';
import { GiLargePaintBrush } from 'react-icons/gi';
import { FaRegHandshake } from 'react-icons/fa6';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaLongArrowAltRight } from 'react-icons/fa';


export default function ScanLanding() {
  const buttonsRef = useRef([]);
  const logoRef = useRef(null);

  const [searchParams] = useSearchParams();
  const [clusterId, setClusterId] = useState(null);

  useEffect(() => {
    const id = searchParams.get("clusterId");
    if (id) setClusterId(id);
  }, [searchParams]);

  useEffect(() => {
    gsap.fromTo(
      buttonsRef.current,
      { scale: 0 },
      {
        scale: 1.1,
        duration: 0.6,
        ease: "back.out(2)",
        stagger: 0.2,
        delay: 0.8,
        onComplete: () => {
          gsap.to(buttonsRef.current, {
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
            delay: 1,
            stagger: 0.2,
          });
        },
      }
    );

    gsap.fromTo(
      logoRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const buttonStyle =
    "w-full py-4 text-lg font-semibold rounded-2xl shadow-lg text-center relative flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 hover:scale-105";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative p-6"
      style={{
        backgroundImage: `url(${mandirImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/60"></div>

      <div className="absolute top-4 left-4 z-20">
        <img
          ref={logoRef}
          src={logo}
          alt="Sanitrack Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 drop-shadow-lg"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center -mt-8">
        {/* Text slightly above */}
        <h1 className="text-4xl font-bold text-black mb-2 text-center">
          आपका एक कदम, लाखों के लिए स्वच्छता
        </h1>

        {/* Folded hand icon below the text */}
        <FaPrayingHands size={40} className="text-gray-800 mb-8" />

        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold 
                   text-gray-800 mb-10 text-center flex items-center gap-2"
        >
          🚻 Welcome to <span className="text-blue-600">Sanitrack</span>
        </h1>

        <div className="grid grid-cols-1 gap-5 w-full max-w-sm">
          <Link
            ref={(el) => (buttonsRef.current[0] = el)}
            to={`/pilgrim${clusterId ? `?clusterId=${clusterId}` : ""}`}
            className={`${buttonStyle} bg-gradient-to-r from-green-400 to-green-600 text-black shadow-green-200`}
          >
            <IoIosPeople size={24} /> I am a Pilgrim
          </Link>

          <Link
            ref={(el) => (buttonsRef.current[1] = el)}
            to={`auth/register?role=cleaner${clusterId ? `&clusterId=${clusterId}` : ""}`}
            className={`${buttonStyle} bg-gradient-to-r from-blue-400 to-blue-600 text-black shadow-blue-200`}
          >
            <GiLargePaintBrush size={24} /> I am a Cleaner
          </Link>

          <Link
            ref={(el) => (buttonsRef.current[2] = el)}
            to={`auth/register?role=volunteer${clusterId ? `&clusterId=${clusterId}` : ""}`}
            className={`${buttonStyle} bg-gradient-to-r from-purple-400 to-purple-600 text-black shadow-purple-300`}
          >
            <FaRegHandshake size={24} /> I am a Volunteer
          </Link>

          <Link
            ref={(el) => (buttonsRef.current[3] = el)}
            to={`/toilets${clusterId ? `?clusterId=${clusterId}` : ""}`}
            className={`${buttonStyle} bg-gradient-to-r from-yellow-400 to-yellow-600 text-black`}
          >
            <FaMapMarkerAlt size={24} /> Nearby Toilets 
          </Link>
        </div>
      </div>
    </div>
  );
}
