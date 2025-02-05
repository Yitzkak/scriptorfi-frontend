import  React from 'react';

const CallToActionBanner = () => {
    return(
        <div class="bg-mint-green py-8 flex flex-col lg:flex-row items-center justify-center mt-20 gap-6">
            <h5 class="text-lg font-bold text-gray-600 text-center md:text-left sm:text-2xl">
                Your Words, Transcribed with Precision.
            </h5>
            <div class="flex space-x-4">
                <button class="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors duration-200">
                    Free trial
                </button>
                <button class="px-6 py-3 border border-black text-black font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200">
                    Upload a file
                </button>
                
            </div>
        </div>

    )
}

export default CallToActionBanner;