from rest_framework import serializers
from .models import Usuario, Tarefa

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'  

class TarefaSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),  # busca usuários válidos
        source='usuario',                # mapeia para o campo do model
        write_only=True                  # só é usado para escrever, não aparece no GET
    )

    class Meta:
        model = Tarefa
        fields = '__all__'
        