import React from 'react';

const sections = [
  {
    icon: 'lock',
    title: 'Bảo mật thông tin',
    content: 'MathQuest cam kết bảo vệ thông tin cá nhân của bạn. Chúng tôi sử dụng mã hóa SSL/TLS cho toàn bộ dữ liệu truyền tải và lưu trữ mật khẩu dưới dạng hash an toàn (bcrypt).'
  },
  {
    icon: 'visibility_off',
    title: 'Quyền riêng tư',
    content: 'Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba. Dữ liệu chỉ được sử dụng để cải thiện trải nghiệm người dùng và vận hành hệ thống.'
  },
  {
    icon: 'cookie',
    title: 'Cookie',
    content: 'Chúng tôi sử dụng cookie để duy trì phiên đăng nhập và ghi nhớ tùy chỉnh của bạn. Bạn có thể tắt cookie trong trình duyệt, nhưng một số tính năng sẽ không hoạt động.'
  },
  {
    icon: 'delete',
    title: 'Quyền xóa dữ liệu',
    content: 'Bạn có quyền yêu cầu xóa toàn bộ dữ liệu tài khoản bất kỳ lúc nào. Gửi email đến support@mathquest.com với tiêu đề "Xóa tài khoản" và chúng tôi sẽ xử lý trong vòng 48 giờ.'
  },
  {
    icon: 'child_care',
    title: 'Bảo vệ trẻ em',
    content: 'MathQuest an toàn cho mọi lứa tuổi. Chúng tôi không thu thập thông tin của người dùng dưới 13 tuổi mà không có sự đồng ý của phụ huynh.'
  },
  {
    icon: 'security',
    title: 'Chính sách bảo mật',
    content: 'Chúng tôi thường xuyên cập nhật chính sách bảo mật để tuân thủ các quy định pháp luật hiện hành. Mọi thay đổi sẽ được thông báo trên trang web và qua email.'
  }
];

export default function PrivacyCenter() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <span className="material-symbols-outlined text-5xl text-primary mb-4">security</span>
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Trung tâm Bảo mật</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Chúng tôi coi trọng sự riêng tư của bạn</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((sec, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#1a2e20] border border-[#e0e8e2] dark:border-[#2a3f31] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">{sec.icon}</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{sec.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{sec.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-yellow-600 text-3xl mb-2">contact_mail</span>
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          Mọi thắc mắc về bảo mật, vui lòng liên hệ:{' '}
          <a href="mailto:support@mathquest.com" className="underline font-bold">support@mathquest.com</a>
        </p>
      </div>
    </div>
  );
}
