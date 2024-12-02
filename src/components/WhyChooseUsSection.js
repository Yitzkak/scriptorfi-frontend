import { ArrowRightIcon } from '@heroicons/react/24/solid';

function WhyChooseUs() {
  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="text-3xl font-extrabold text-center text-gray-900 pt-10 md:text-4xl lg:text-5xl">
        Why Choose Us
      </div>

      {/* Highlights Section */}
      <div className="flex flex-col items-center md:flex-row md:justify-center mt-12 px-4 md:px-8 lg:px-16">
        {/* Image Section */}
        <div className="w-full md:w-2/5 lg:w-1/2 flex justify-center">
          <img
            src="/images/front-view-teenage-girl-with-headphones-online-school.jpg"
            alt="Person working on transcription"
            className="w-full sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[30rem] lg:h-[30rem] object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-3/5 lg:w-1/2 text-center md:text-left px-4 mt-8 md:mt-0">
          <div className="flex flex-col space-y-8 py-4">
            {/* Security & Privacy */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Security & Privacy</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">
                Your data is safe with us. We implement top-notch security measures to ensure the privacy and confidentiality of all transcripts.
              </p>
            </div>

            {/* Speed & Accuracy */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Speed & Accuracy</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">
                Get accurate transcripts delivered quickly. We balance efficiency with precision to meet your timelines.
              </p>
            </div>

            {/* Low Cost */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Low Cost</h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">
                Enjoy high-quality transcription services at an affordable rate, tailored to fit your budget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhyChooseUs;
