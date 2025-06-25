import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Select from '@/components/atoms/Select';

const FormField = ({ type = 'input', ...props }) => {
  switch (type) {
    case 'textarea':
      return <TextArea {...props} />;
    case 'select':
      return <Select {...props} />;
    default:
      return <Input {...props} />;
  }
};

export default FormField;